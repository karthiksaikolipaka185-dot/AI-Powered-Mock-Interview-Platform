const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt.utils');
const { verifyGoogleToken } = require('../config/google.config');
const { sendEmailVerificationLink } = require('./email.service');

// RFC 5322 Compliant Email Validation Regex
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate email format against RFC standards.
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    return RFC_EMAIL_REGEX.test(email.trim());
};

/**
 * Validate password strength against security policy:
 * Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character.
 */
const validatePasswordPolicy = (password) => {
    if (!password || password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number.' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*).' };
    }
    return { valid: true };
};

/**
 * Register a new user with RFC email validation, strong password enforcement, and verification token.
 */
const register = async (name, email, password) => {
    // 1. RFC Email Format Check
    if (!isValidEmail(email)) {
        const error = new Error('Please provide a valid email address (e.g. user@domain.com).');
        error.statusCode = 400;
        throw error;
    }

    // 2. Password Strength Check
    const passwordCheck = validatePasswordPolicy(password);
    if (!passwordCheck.valid) {
        const error = new Error(passwordCheck.message);
        error.statusCode = 400;
        throw error;
    }

    // 3. Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        const error = new Error('An account with this email address already exists.');
        error.statusCode = 400;
        throw error;
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Generate secure verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 6. Create user (isVerified defaults to false)
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpires
    });

    // 7. Dispatch Verification Email
    sendEmailVerificationLink(user.email, verificationToken).catch(err => {
        console.error('[AuthService] Verification email send error:', err.message);
    });

    return {
        requiresVerification: true,
        message: 'Account created successfully! Please verify your email before logging in.',
        user: { id: user._id, name: user.name, email: user.email, isVerified: false }
    };
};

/**
 * Verify user email address using verification token.
 */
const verifyEmailToken = async (token) => {
    if (!token) {
        const error = new Error('Verification token is required.');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        const error = new Error('Invalid or expired email verification link.');
        error.statusCode = 400;
        throw error;
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return {
        success: true,
        message: 'Email address verified successfully! You may now sign in.'
    };
};

/**
 * Login a user with email and password, gating unverified users.
 */
const emailLogin = async (email, password) => {
    if (!isValidEmail(email)) {
        const error = new Error('Please provide a valid email address.');
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
        const error = new Error('Invalid email address or password.');
        error.statusCode = 401;
        throw error;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid email address or password.');
        error.statusCode = 401;
        throw error;
    }

    // PART 4: Check Email Verification Status Gate
    if (user.isVerified === false) {
        const error = new Error('Please verify your email before logging in.');
        error.statusCode = 403;
        throw error;
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = generateToken(user);

    return {
        token,
        user: { id: user._id, name: user.name, email: user.email, picture: user.picture, isVerified: user.isVerified }
    };
};

/**
 * Login or Register a user via Google OAuth (Auto-verifying Google account).
 */
const googleLogin = async (credential) => {
    // 1. Verify Google token
    const payload = await verifyGoogleToken(credential);
    const { sub: googleId, email, name, picture } = payload;

    const normalizedEmail = email.toLowerCase();

    // 2. Find or update user (Upsert, marking isVerified = true)
    const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        { 
            googleId, 
            name, 
            picture, 
            isVerified: true,
            lastLogin: new Date() 
        },
        { new: true, upsert: true }
    );

    // 3. Generate JWT
    const token = generateToken(user);

    return {
        token,
        user: { id: user._id, name: user.name, email: user.email, picture: user.picture, isVerified: user.isVerified }
    };
};

/**
 * Fetch authenticated user profile.
 */
const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-__v -googleId -password -verificationToken -verificationTokenExpires');
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    return user;
};

module.exports = {
    isValidEmail,
    validatePasswordPolicy,
    register,
    verifyEmailToken,
    emailLogin,
    googleLogin,
    getUserProfile
};
