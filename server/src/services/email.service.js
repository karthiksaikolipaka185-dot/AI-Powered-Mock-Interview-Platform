const { Resend } = require('resend');

// Initialize Resend SDK
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Helper to send email using Resend SDK with improved logging.
 */
const sendResendEmail = async ({ to, subject, html }) => {
    try {
        if (!resend) {
            console.log(`[EmailService] Resend SDK not initialized (missing API key). Email would be sent to: ${to}`);
            return { sent: false, error: 'Resend API key missing' };
        }

        // Resend requires verified domain, or onboarding@resend.dev as the sender address.
        const fromAddress = 'onboarding@resend.dev';
        const { data, error } = await resend.emails.send({
            from: `Mock Interview Platform <${fromAddress}>`,
            to,
            subject,
            html
        });

        if (error) {
            console.error('✗ Email failed. Error:', error.message || JSON.stringify(error));
            return { sent: false, error };
        }

        console.log('✓ Email sent successfully. ID:', data.id);
        return { sent: true, id: data.id };
    } catch (error) {
        console.error('✗ Email failed. Error:', error.message);
        return { sent: false, error: error.message };
    }
};

/**
 * Send email verification link after candidate registration.
 */
const sendEmailVerificationLink = async (userEmail, verificationToken) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationLink = `${clientUrl}/verify-email/${verificationToken}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #4f46e5; margin-bottom: 16px;">Welcome to AI Mock Interview Platform</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                Thank you for signing up! Please verify your email address to activate your account and begin practicing your interview skills.
            </p>
            <div style="margin: 28px 0; text-align: center;">
                <a href="${verificationLink}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">
                    Verify Email Address
                </a>
            </div>
            <p style="color: #64748b; font-size: 13px;">
                Or copy and paste this verification URL into your browser:<br/>
                <a href="${verificationLink}" style="color: #4f46e5;">${verificationLink}</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                This verification link will expire in 24 hours. If you did not create an account, you can safely ignore this message.
            </p>
        </div>
    `;

    const result = await sendResendEmail({
        to: userEmail,
        subject: 'Verify Your Email Address - AI Mock Interview Platform',
        html
    });

    return {
        sent: result.sent,
        messageId: result.id,
        verificationLink,
        error: result.error
    };
};

/**
 * Send email notification when user submits feedback.
 */
const sendFeedbackEmailNotification = async (feedbackData, userEmail = 'Candidate') => {
    const recipient = process.env.OWNER_EMAIL;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
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

    const result = await sendResendEmail({
        to: recipient,
        subject: `[Candidate Feedback] ${feedbackData.rating}★ Rating from ${userEmail}`,
        html
    });

    return {
        sent: result.sent,
        messageId: result.id,
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

    const result = await sendResendEmail({
        to: userEmail,
        subject: 'Reset Your Password - AI Mock Interview Platform',
        html
    });

    return {
        sent: result.sent,
        messageId: result.id,
        error: result.error
    };
};

module.exports = {
    sendEmailVerificationLink,
    sendFeedbackEmailNotification,
    sendPasswordResetEmail
};
