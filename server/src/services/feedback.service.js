const mongoose = require('mongoose');
const Feedback = require('../models/Feedback.model');
const { sendFeedbackEmailNotification } = require('./email.service');
const { askGemini } = require('./gemini.service');

/**
 * Asynchronously analyze sentiment and generate a concise summary using AI.
 */
const analyzeSentimentAndSummary = async (rating, favoriteFeature, suggestion) => {
    try {
        const prompt = `Analyze the following candidate feedback for an AI Mock Interview Platform:
Rating: ${rating}/5 Stars
Favorite Feature: ${favoriteFeature}
Suggestion: ${suggestion || 'None'}

Respond with ONLY a valid JSON object matching this schema:
{
  "sentiment": "Positive" | "Neutral" | "Negative",
  "summary": "One sentence concise summary"
}`;
        const rawAi = await askGemini(prompt);
        const match = rawAi.match(/\{[\s\S]*\}/);
        if (match) {
            const parsed = JSON.parse(match[0]);
            return {
                sentiment: ['Positive', 'Neutral', 'Negative'].includes(parsed.sentiment) ? parsed.sentiment : (rating >= 4 ? 'Positive' : 'Neutral'),
                summary: parsed.summary || 'Candidate feedback received.'
            };
        }
    } catch (err) {
        console.warn('[FeedbackService] Non-blocking AI sentiment analysis fallback:', err.message);
    }
    return {
        sentiment: rating >= 4 ? 'Positive' : (rating >= 3 ? 'Neutral' : 'Negative'),
        summary: suggestion ? suggestion.substring(0, 100) : 'Candidate feedback received.'
    };
};

/**
 * Submit candidate feedback, save to MongoDB with AI sentiment analysis, and dispatch email notification.
 */
const submitFeedbackService = async ({ userId, rating, category, favoriteFeature, message, suggestion, page, userEmail }) => {
    const numRating = Number(rating);
    if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
        const error = new Error('Rating must be between 1 and 5 stars.');
        error.statusCode = 400;
        throw error;
    }

    const finalMessage = (message || suggestion || '').trim();
    if (!finalMessage) {
        const error = new Error('Feedback message is required.');
        error.statusCode = 400;
        throw error;
    }

    if (finalMessage.length < 3) {
        const error = new Error('Feedback message must be at least 3 characters long.');
        error.statusCode = 400;
        throw error;
    }

    if (finalMessage.length > 2000) {
        const error = new Error('Feedback message cannot exceed 2000 characters.');
        error.statusCode = 400;
        throw error;
    }

    const finalCategory = (category || favoriteFeature || 'General').trim();
    const finalPage = page ? String(page).substring(0, 500) : '';

    const validUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : new mongoose.Types.ObjectId('507f191e810c19729de860ea');

    // Perform AI sentiment analysis asynchronously (with fallback)
    const { sentiment, summary } = await analyzeSentimentAndSummary(numRating, finalCategory, finalMessage);

    // 1. Save feedback record in MongoDB
    const feedback = await Feedback.create({
        userId: validUserId,
        rating: numRating,
        category: finalCategory,
        favoriteFeature: finalCategory,
        suggestion: finalMessage,
        message: finalMessage,
        page: finalPage,
        reviewStatus: 'Pending',
        sentiment,
        summary
    });

    // 2. Dispatch email notification asynchronously
    sendFeedbackEmailNotification(feedback, userEmail).catch(err => {
        console.error('[FeedbackService] Non-blocking email error:', err.message);
    });

    return feedback;
};

/**
 * Get all submitted feedback items populated with user info.
 */
const getFeedbackService = async () => {
    return await Feedback.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
};

module.exports = {
    submitFeedback: submitFeedbackService,
    createFeedback: submitFeedbackService,
    getFeedback: getFeedbackService
};
