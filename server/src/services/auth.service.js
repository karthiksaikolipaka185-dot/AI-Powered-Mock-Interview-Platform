const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt.utils');
const { verifyGoogleToken } = require('../config/google.config');

/**
 * Register a new user with email and password.
 */
const register = async (name, email, password) => {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
    }

    // 2. Hash password (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    // 4. Generate JWT
    const token = generateToken(user);

    return { token, user: { id: user._id, name: user.name, email: user.email, picture: user.picture } };
};

/**
 * Login a user with email and password.
 */
const emailLogin = async (email, password) => {
    // 1. Find user
    const user = await User.findOne({ email });
    if (!user || !user.password) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // 3. Generate JWT
    const token = generateToken(user);

    return { token, user: { id: user._id, name: user.name, email: user.email, picture: user.picture } };
};

/**
 * Login or Register a user via Google OAuth.
 */
const googleLogin = async (credential) => {
    // 1. Verify Google token
    const payload = await verifyGoogleToken(credential);
    const { sub: googleId, email, name, picture } = payload;

    // 2. Find or update user (Upsert)
    const user = await User.findOneAndUpdate(
        { email },
        { 
            googleId, 
            name, 
            picture, 
            lastLogin: new Date() 
        },
        { new: true, upsert: true }
    );

    // 3. Generate JWT
    const token = generateToken(user);

    return { token, user: { id: user._id, name: user.name, email: user.email, picture: user.picture } };
};

/**
 * Fetch authenticated user profile.
 */
const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-__v -googleId -password');
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    return user;
};

module.exports = {
    register,
    emailLogin,
    googleLogin,
    getUserProfile
};
