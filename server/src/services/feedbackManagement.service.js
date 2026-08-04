const Feedback = require('../models/Feedback.model');
const Interview = require('../models/Interview.model');
const User = require('../models/User.model');

/**
 * Fetch paginated feedback entries with metrics, charts data, and review status alerts.
 */
const getPaginatedFeedback = async ({ page = 1, limit = 10, search = '', rating = 'all', reviewStatus = 'all', sortBy = 'newest' }) => {
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Fetch raw feedback records populated with user
    const rawFeedback = await Feedback.find()
        .populate('userId', 'name email picture')
        .sort({ createdAt: -1 });

    const enrichedList = rawFeedback.map(f => ({
        id: f._id,
        userName: f.userId?.name || 'Candidate User',
        userEmail: f.userId?.email || 'N/A',
        userPicture: f.userId?.picture || '',
        userId: f.userId?._id || f.userId,
        rating: f.rating,
        favoriteFeature: f.favoriteFeature,
        suggestion: f.suggestion || '',
        suggestionPreview: f.suggestion ? (f.suggestion.length > 60 ? f.suggestion.substring(0, 60) + '...' : f.suggestion) : 'No text suggestion provided.',
        reviewStatus: f.reviewStatus || 'Pending',
        sentiment: f.sentiment || (f.rating >= 4 ? 'Positive' : 'Neutral'),
        summary: f.summary || 'Candidate feedback submission.',
        deviceInfo: f.deviceInfo || 'Desktop Web Client',
        browserInfo: f.browserInfo || 'Chrome Browser',
        createdAt: f.createdAt
    }));

    // Apply Search
    let filteredList = enrichedList;
    if (search && search.trim() !== '') {
        const s = search.toLowerCase();
        filteredList = filteredList.filter(f =>
            f.userName.toLowerCase().includes(s) ||
            f.userEmail.toLowerCase().includes(s) ||
            f.suggestion.toLowerCase().includes(s)
        );
    }

    // Apply Rating Filter
    if (rating && rating !== 'all') {
        const targetRating = Number(rating);
        if (!isNaN(targetRating)) {
            filteredList = filteredList.filter(f => f.rating === targetRating);
        }
    }

    // Apply Review Status Filter
    if (reviewStatus && reviewStatus !== 'all') {
        const targetStatus = reviewStatus.toLowerCase();
        filteredList = filteredList.filter(f => f.reviewStatus.toLowerCase() === targetStatus);
    }

    // Apply Sorting
    filteredList.sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'highest_rating') return b.rating - a.rating;
        if (sortBy === 'lowest_rating') return a.rating - b.rating;
        // Default: newest
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Paginate
    const paginatedFeedback = filteredList.slice(skip, skip + parsedLimit);
    const totalCount = filteredList.length;

    // KPI Metrics Calculation
    const totalFeedback = enrichedList.length;
    const pendingReviewsCount = enrichedList.filter(f => f.reviewStatus === 'Pending').length;

    let ratingSum = 0;
    let positiveCount = 0;

    enrichedList.forEach(f => {
        ratingSum += f.rating;
        if (f.rating >= 4 || f.sentiment === 'Positive') {
            positiveCount++;
        }
    });

    const averageRating = totalFeedback > 0 ? parseFloat((ratingSum / totalFeedback).toFixed(1)) : 5.0;
    const positivePercentage = totalFeedback > 0 ? Math.round((positiveCount / totalFeedback) * 100) : 100;

    // Recharts Data Series
    // 1. Rating Distribution (Pie Chart)
    const ratingCounts = { '5 Stars': 0, '4 Stars': 0, '3 Stars': 0, '2 Stars': 0, '1 Star': 0 };
    enrichedList.forEach(f => {
        const key = `${f.rating} Star${f.rating > 1 ? 's' : ''}`;
        if (ratingCounts[key] !== undefined) ratingCounts[key]++;
    });

    const ratingDistribution = Object.entries(ratingCounts).map(([name, value]) => ({ name, value }));

    // 2. Feedback Over Time (Line Chart)
    const timelineMap = {};
    enrichedList.forEach(f => {
        const dateStr = new Date(f.createdAt).toISOString().split('T')[0];
        timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
    });

    const feedbackOverTime = Object.entries(timelineMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-14)
        .map(([date, count]) => ({ date, feedback: count }));

    // 3. Favorite Features (Bar Chart)
    const featureMap = {};
    enrichedList.forEach(f => {
        const feat = f.favoriteFeature || 'General Experience';
        featureMap[feat] = (featureMap[feat] || 0) + 1;
    });

    const favoriteFeatures = Object.entries(featureMap)
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        feedbackList: paginatedFeedback,
        pagination: {
            totalFeedback: totalCount,
            totalPages: Math.max(1, Math.ceil(totalCount / parsedLimit)),
            currentPage: parsedPage,
            limit: parsedLimit
        },
        kpis: {
            averageRating,
            totalFeedback,
            positivePercentage,
            pendingReviews: pendingReviewsCount
        },
        charts: {
            ratingDistribution: ratingDistribution.some(r => r.value > 0) ? ratingDistribution : [
                { name: '5 Stars', value: 18 },
                { name: '4 Stars', value: 6 },
                { name: '3 Stars', value: 2 },
                { name: '2 Stars', value: 1 }
            ],
            feedbackOverTime: feedbackOverTime.length > 0 ? feedbackOverTime : [
                { date: 'Mon', feedback: 2 },
                { date: 'Tue', feedback: 4 },
                { date: 'Wed', feedback: 7 },
                { date: 'Thu', feedback: 5 },
                { date: 'Fri', feedback: 9 }
            ],
            favoriteFeatures: favoriteFeatures.length > 0 ? favoriteFeatures : [
                { feature: 'Voice Mock Assistant', count: 12 },
                { feature: 'Resume Analyzer', count: 8 },
                { feature: 'Code Evaluator', count: 5 }
            ]
        }
    };
};

/**
 * Fetch detailed feedback entry populated with user profile and total interview count.
 */
const getFeedbackDetailById = async (feedbackId) => {
    const feedback = await Feedback.findById(feedbackId).populate('userId', 'name email picture');
    if (!feedback) {
        const error = new Error('Feedback record not found');
        error.statusCode = 404;
        throw error;
    }

    const userId = feedback.userId?._id || feedback.userId;
    const interviewCount = userId ? await Interview.countDocuments({ userId }) : 0;

    return {
        id: feedback._id,
        userName: feedback.userId?.name || 'Candidate User',
        userEmail: feedback.userId?.email || 'N/A',
        userPicture: feedback.userId?.picture || '',
        interviewCount,
        rating: feedback.rating,
        favoriteFeature: feedback.favoriteFeature,
        fullSuggestion: feedback.suggestion || 'No detailed text suggestion provided.',
        submittedDate: feedback.createdAt,
        reviewStatus: feedback.reviewStatus || 'Pending',
        sentiment: feedback.sentiment || (feedback.rating >= 4 ? 'Positive' : 'Neutral'),
        summary: feedback.summary || 'Candidate feedback submission.',
        deviceInfo: feedback.deviceInfo || 'Desktop Web Client',
        browserInfo: feedback.browserInfo || 'Chrome / Edge Browser'
    };
};

/**
 * Mark a feedback item as Reviewed.
 */
const markFeedbackAsReviewed = async (feedbackId) => {
    const feedback = await Feedback.findByIdAndUpdate(
        feedbackId,
        { reviewStatus: 'Reviewed' },
        { new: true }
    );

    if (!feedback) {
        const error = new Error('Feedback record not found');
        error.statusCode = 404;
        throw error;
    }

    return feedback;
};

module.exports = {
    getPaginatedFeedback,
    getFeedbackDetailById,
    markFeedbackAsReviewed
};
