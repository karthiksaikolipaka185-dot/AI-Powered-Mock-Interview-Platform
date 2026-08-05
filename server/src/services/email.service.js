const nodemailer = require('nodemailer');

/**
 * Configure and return a Nodemailer transporter forced to IPv4 (family: 4)
 */
const getTransporter = () => {
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (!user || !pass || pass === 'app_password_placeholder') {
        return null;
    }

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Port 465 + secure:true (best practice for secure SSL/TLS connection)
        auth: {
            user: user,
            pass: pass
        },
        family: 4 // Force IPv4 resolution to bypass ENETUNREACH issues
    });
};

/**
 * Perform transporter verification to audit SMTP connection on startup.
 */
const verifyTransporter = async () => {
    try {
        const transporter = getTransporter();
        if (!transporter) {
            console.log('[EmailService] SMTP credentials not set or using placeholder. Transporter verification skipped.');
            return false;
        }

        await transporter.verify();
        console.log('[EmailService] ✓ SMTP Connection Verified successfully.');
        return true;
    } catch (error) {
        console.error('[EmailService] ✗ SMTP Transporter Verification failed.');
        printEmailErrorDiagnostics(error);
        return false;
    }
};

/**
 * Helper to log comprehensive, diagnostic error details.
 */
const printEmailErrorDiagnostics = (error) => {
    console.error('====================================================');
    console.error('[EmailService] Comprehensive SMTP Error Diagnostics:');
    console.error(`- Error Code: ${error.code || 'N/A'}`);
    console.error(`- Command: ${error.command || 'N/A'}`);
    console.error(`- Response: ${error.response || 'N/A'}`);
    console.error(`- Response Code: ${error.responseCode || 'N/A'}`);
    console.error(`- Address: ${error.address || 'N/A'}`);
    console.error(`- Port: ${error.port || 'N/A'}`);
    console.error(`- Details: ${error.message}`);
    console.error('----------------------------------------------------');
    
    if (error.code === 'EAUTH' || error.message.includes('authentication')) {
        console.error('💡 Recommended Action: Authentication failed. Verify EMAIL_USER and EMAIL_PASS.');
        console.error('   Ensure you are using a Gmail App Password, NOT your master account password.');
    } else if (error.code === 'ENETUNREACH' || error.code === 'ETIMEDOUT' || error.message.includes('ENETUNREACH')) {
        console.error('💡 Recommended Action: Network connection failed (connect ENETUNREACH / ETIMEDOUT).');
        console.error('   Outgoing connection to smtp.gmail.com is blocked or routed improperly on IPv6.');
        console.error('   If this environment continues to block SMTP connections on ports 465/587,');
        console.error('   we strongly recommend switching to a web API-based transactional email service.');
        console.error('   Examples: Resend (https://resend.com) or SendGrid (https://sendgrid.com).');
    }
    console.error('====================================================');
};

/**
 * Helper to send email with exponential backoff retries.
 */
const sendMailWithRetry = async (transporter, mailOptions, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const info = await transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            console.warn(`[EmailService] Attempt ${attempt}/${retries} failed. Error: ${error.message}`);
            if (attempt === retries) {
                throw error;
            }
            const backoffDelay = delay * Math.pow(2, attempt - 1);
            console.log(`[EmailService] Retrying in ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }
};

/**
 * Send email verification link after candidate registration.
 */
const sendEmailVerificationLink = async (userEmail, verificationToken) => {
    try {
        const user = process.env.EMAIL_USER || process.env.SMTP_USER;
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verificationLink = `${clientUrl}/verify-email/${verificationToken}`;

        const transporter = getTransporter();
        if (!transporter) {
            console.log(`[EmailService] SMTP credentials not set or using placeholder. Verification link generated for ${userEmail}: ${verificationLink}`);
            return { sent: false, verificationLink, reason: 'SMTP Credentials placeholder' };
        }

        const mailOptions = {
            from: `"Mock Interview Platform" <${user}>`,
            to: userEmail,
            subject: 'Verify Your Email Address - AI Mock Interview Platform',
            html: `
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
            `
        };

        const info = await sendMailWithRetry(transporter, mailOptions);
        console.log('[EmailService] Verification email sent successfully to', userEmail, 'MessageId:', info.messageId);
        return { sent: true, messageId: info.messageId, verificationLink };
    } catch (error) {
        console.error('[EmailService] Failed to send verification email after retries.');
        printEmailErrorDiagnostics(error);
        return { sent: false, error: error.message, details: error };
    }
};

/**
 * Send email notification when user submits feedback.
 */
const sendFeedbackEmailNotification = async (feedbackData, userEmail = 'Candidate') => {
    try {
        const user = process.env.EMAIL_USER || process.env.SMTP_USER;
        const recipient = process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL || user;

        const transporter = getTransporter();
        if (!transporter) {
            console.log('[EmailService] EMAIL_USER / EMAIL_PASS missing or placeholder. Skipping email dispatch.');
            return { sent: false, reason: 'Credentials not configured' };
        }

        const mailOptions = {
            from: `"Mock Interview Platform" <${user}>`,
            to: recipient,
            subject: `[Candidate Feedback] ${feedbackData.rating}★ Rating from ${userEmail}`,
            html: `
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
            `
        };

        const info = await sendMailWithRetry(transporter, mailOptions);
        console.log('[EmailService] Feedback email sent successfully:', info.messageId);
        return { sent: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EmailService] Failed to send feedback email after retries.');
        printEmailErrorDiagnostics(error);
        return { sent: false, error: error.message, details: error };
    }
};

module.exports = {
    verifyTransporter,
    sendEmailVerificationLink,
    sendFeedbackEmailNotification
};
