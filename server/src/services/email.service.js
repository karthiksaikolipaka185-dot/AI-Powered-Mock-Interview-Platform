const postmark = require('postmark');

/**
 * Get configured Postmark client using POSTMARK_SERVER_TOKEN.
 */
const getPostmarkClient = () => {
    const token = process.env.POSTMARK_SERVER_TOKEN;
    if (!token || !token.trim()) return null;
    return new postmark.ServerClient(token.trim());
};

/**
 * Safely mask an email address for privacy-compliant diagnostic logging.
 * Example: karthiksaikolipaka185@gmail.com -> k***5@gmail.com
 */
const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return '***';
    const parts = email.split('@');
    if (parts.length !== 2) return '***';
    const [name, domain] = parts;
    const maskedName = name.length > 2 
        ? `${name[0]}***${name[name.length - 1]}` 
        : `${name[0]}***`;
    return `${maskedName}@${domain}`;
};

/**
 * Get configured sender email address.
 * Prioritizes EMAIL_FROM, then EMAIL_USER, then OWNER_EMAIL.
 */
const getSenderEmail = () => {
    return process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.OWNER_EMAIL || '';
};

/**
 * Audit Postmark email configuration status (without printing secrets).
 */
const auditEmailConfiguration = () => {
    const serverTokenConfigured = Boolean(process.env.POSTMARK_SERVER_TOKEN && process.env.POSTMARK_SERVER_TOKEN.trim() !== '');
    const senderConfigured = Boolean(getSenderEmail() && getSenderEmail().trim() !== '');

    console.log('--- Email Service Startup Audit ---');
    console.log('Provider: Postmark');
    console.log(`Server Token: ${serverTokenConfigured ? 'configured' : 'missing'}`);
    console.log(`Sender: ${senderConfigured ? 'configured' : 'missing'}`);

    if (serverTokenConfigured && senderConfigured) {
        console.log('Status: ready');
    } else {
        console.log('[EmailService] Postmark configuration incomplete.');
        console.log('Status: incomplete');
    }
    console.log('-----------------------------------');

    return { serverTokenConfigured, senderConfigured, isReady: serverTokenConfigured && senderConfigured };
};

/**
 * Core helper to send transactional email using Postmark Web API.
 */
const sendPostmarkEmail = async ({ to, subject, html, text }) => {
    const sender = getSenderEmail();
    const token = process.env.POSTMARK_SERVER_TOKEN;

    if (!token || !token.trim()) {
        console.error('[EmailService] Postmark configuration incomplete. Missing POSTMARK_SERVER_TOKEN.');
        return { sent: false, error: 'Postmark server token missing' };
    }

    if (!sender || !sender.trim()) {
        console.error('[EmailService] Postmark configuration incomplete. Missing sender email (EMAIL_FROM).');
        return { sent: false, error: 'Postmark sender email (EMAIL_FROM) missing' };
    }

    const maskedRecipient = maskEmail(to);
    console.log(`[EmailService] Sending verification email`);
    console.log(`Recipient: ${maskedRecipient}`);
    console.log(`Provider: Postmark`);

    const client = getPostmarkClient();

    try {
        const response = await client.sendEmail({
            From: sender.includes('<') ? sender : `MockInterview Platform <${sender}>`,
            To: to,
            Subject: subject,
            HtmlBody: html,
            TextBody: text || html.replace(/<[^>]*>?/gm, '')
        });

        console.log(`[EmailService] Verification email dispatched successfully`);
        console.log(`Provider: Postmark`);
        console.log(`Recipient: ${maskedRecipient}`);
        if (response && response.MessageID) {
            console.log(`MessageID: ${response.MessageID}`);
        }

        return { sent: true, statusCode: 200, messageId: response ? response.MessageID : null };
    } catch (error) {
        const statusCode = error.statusCode || error.code || 500;
        const errorMessage = error.message || 'Unknown Postmark error';

        console.error(`[EmailService] Postmark email dispatch error`);
        console.error(`Status: ${statusCode}`);
        console.error(`Error: ${errorMessage}`);

        return { sent: false, statusCode, error: errorMessage };
    }
};

/**
 * Send email verification link after candidate registration.
 */
const sendEmailVerificationLink = async (userEmail, verificationToken) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationLink = `${clientUrl}/verify-email/${verificationToken}`;

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 28px;">
                <h1 style="color: #4f46e5; font-size: 24px; font-weight: 800; margin: 0;">MockInterview Platform</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">AI-Powered Mock Interview Platform</p>
            </div>
            
            <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Verify your MockInterview account</h2>
            
            <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                Welcome to MockInterview! Please verify your email address to activate your account and start practicing with your personalized AI interviewer.
            </p>
            
            <div style="margin: 32px 0; text-align: center;">
                <a href="${verificationLink}" target="_blank" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);">
                    Verify Email Address
                </a>
            </div>
            
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 16px;">
                If the button above does not work, copy and paste this verification URL into your browser:<br/>
                <a href="${verificationLink}" style="color: #4f46e5; word-break: break-all;">${verificationLink}</a>
            </p>
            
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                <p style="margin-bottom: 8px;"><strong>Token Expiration:</strong> This verification link will expire in 24 hours.</p>
                <p style="margin: 0;"><strong>Security Notice:</strong> If you did not create an account on MockInterview, you can safely ignore this email.</p>
            </div>
        </div>
    `;

    const text = `Verify your MockInterview account\n\nPlease verify your email address by visiting the following link:\n${verificationLink}\n\nThis link expires in 24 hours.`;

    const result = await sendPostmarkEmail({
        to: userEmail,
        subject: 'Verify your MockInterview account',
        html,
        text
    });

    return {
        sent: result.sent,
        statusCode: result.statusCode,
        verificationLink,
        error: result.error
    };
};

/**
 * Send email notification when user submits feedback.
 */
const sendFeedbackEmailNotification = async (feedbackData, userEmail = 'Candidate') => {
    const recipient = process.env.OWNER_EMAIL || getSenderEmail();
    if (!recipient) {
        return { sent: false, error: 'Recipient email missing' };
    }

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; margin-bottom: 16px;">New Candidate Feedback Received</h2>
            <p><strong>Candidate Email:</strong> ${userEmail}</p>
            <p><strong>Rating:</strong> ${'★'.repeat(feedbackData.rating)}${'☆'.repeat(5 - feedbackData.rating)} (${feedbackData.rating}/5)</p>
            <p><strong>Favorite Feature:</strong> ${feedbackData.favoriteFeature || 'N/A'}</p>
            <p><strong>Suggestion / Notes:</strong></p>
            <blockquote style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #4f46e5; margin: 0;">
                ${feedbackData.suggestion || 'No text feedback provided.'}
            </blockquote>
            <hr style="margin-top: 24px; border: none; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 12px; color: #64748b;">AI-Powered Mock Interview Platform</p>
        </div>
    `;

    const result = await sendPostmarkEmail({
        to: recipient,
        subject: `[Candidate Feedback] ${feedbackData.rating}★ Rating from ${userEmail}`,
        html
    });

    return {
        sent: result.sent,
        statusCode: result.statusCode,
        error: result.error
    };
};

/**
 * Send password reset email with reset link.
 */
const sendPasswordResetEmail = async (userEmail, resetToken) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #4f46e5; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                You requested to reset your password for the AI Mock Interview Platform. Please click the button below to set a new password.
            </p>
            <div style="margin: 28px 0; text-align: center;">
                <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p style="color: #64748b; font-size: 13px;">
                Or copy and paste this reset URL into your browser:<br/>
                <a href="${resetLink}" style="color: #4f46e5;">${resetLink}</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                This password reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
            </p>
        </div>
    `;

    const result = await sendPostmarkEmail({
        to: userEmail,
        subject: 'Reset Your Password - MockInterview',
        html
    });

    return {
        sent: result.sent,
        statusCode: result.statusCode,
        error: result.error
    };
};

module.exports = {
    auditEmailConfiguration,
    sendEmailVerificationLink,
    sendFeedbackEmailNotification,
    sendPasswordResetEmail
};

