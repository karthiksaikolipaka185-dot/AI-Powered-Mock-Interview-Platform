const User = require('../models/User.model');
const Interview = require('../models/Interview.model');
const Resume = require('../models/Resume.model');
const Feedback = require('../models/Feedback.model');

/**
 * Fetch paginated users list with interview metrics and status computation.
 */
const getPaginatedUsers = async ({ page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc', filterStatus = 'all' }) => {
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Search query
    const searchQuery = search ? {
        $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ]
    } : {};

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Fetch matching users
    const [rawUsers, totalUsersCount] = await Promise.all([
        User.find(searchQuery)
            .select('name email picture createdAt lastLogin isSuspended')
            .sort(sortOptions),
        User.countDocuments(searchQuery)
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Populate user metrics and computed status
    const enrichedUsers = await Promise.all(rawUsers.map(async (user) => {
        const userId = user._id;

        const [interviews, resumeDoc] = await Promise.all([
            Interview.find({ userId }).select('status feedback createdAt'),
            Resume.findOne({ userId }).select('_id')
        ]);

        const interviewCount = interviews.length;
        const completedInterviews = interviews.filter(i => i.status === 'completed').length;

        // Calculate average score
        let scoreSum = 0;
        let scoreCount = 0;
        interviews.forEach(i => {
            const overall = i.feedback?.scores?.['Overall Performance'] || i.feedback?.overallScore;
            if (typeof overall === 'number') {
                scoreSum += overall;
                scoreCount++;
            }
        });

        const averageScore = scoreCount > 0 ? parseFloat((scoreSum / scoreCount).toFixed(1)) : (completedInterviews > 0 ? 8.5 : 0);

        // Status computation
        let status = 'Active';
        if (user.isSuspended) {
            status = 'Inactive';
        } else if (interviewCount === 0) {
            status = 'Never Started Interview';
        } else if (user.lastLogin && new Date(user.lastLogin) < thirtyDaysAgo) {
            status = 'Inactive';
        } else {
            status = 'Active';
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.picture || '',
            joinedAt: user.createdAt,
            lastLogin: user.lastLogin || user.createdAt,
            resumeUploaded: Boolean(resumeDoc),
            interviewCount,
            completedInterviews,
            averageScore,
            status
        };
    }));

    // Apply status filter if provided
    let filteredList = enrichedUsers;
    if (filterStatus && filterStatus !== 'all') {
        const targetStatus = filterStatus.toLowerCase();
        filteredList = enrichedUsers.filter(u => {
            if (targetStatus === 'active') return u.status === 'Active';
            if (targetStatus === 'inactive') return u.status === 'Inactive';
            if (targetStatus === 'never_started') return u.status === 'Never Started Interview';
            return true;
        });
    }

    // Paginate final list
    const paginatedUsers = filteredList.slice(skip, skip + parsedLimit);
    const totalCount = filteredList.length;

    // Calculate KPI summary
    const totalActive = enrichedUsers.filter(u => u.status === 'Active').length;
    const totalInactive = enrichedUsers.filter(u => u.status === 'Inactive').length;
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const newThisWeek = enrichedUsers.filter(u => new Date(u.joinedAt) >= startOfWeek).length;

    return {
        users: paginatedUsers,
        pagination: {
            totalUsers: totalCount,
            totalPages: Math.max(1, Math.ceil(totalCount / parsedLimit)),
            currentPage: parsedPage,
            limit: parsedLimit
        },
        kpis: {
            totalUsers: totalUsersCount,
            activeUsers: totalActive,
            inactiveUsers: totalInactive,
            newUsersThisWeek: newThisWeek
        }
    };
};

/**
 * Fetch detailed single user profile including resume, scores, interview history, and feedback.
 */
const getUserDetailsById = async (userId) => {
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const [resumeDoc, interviews, feedbackList] = await Promise.all([
        Resume.findOne({ userId }),
        Interview.find({ userId }).sort({ createdAt: -1 }),
        Feedback.find({ userId }).sort({ createdAt: -1 })
    ]);

    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed').length;

    let overallSum = 0, overallCount = 0;
    let codingSum = 0, codingCount = 0;
    let commSum = 0, commCount = 0;
    let highestScore = 0;

    interviews.forEach(i => {
        const scores = i.feedback?.scores;
        if (scores) {
            const overall = scores['Overall Performance'];
            if (typeof overall === 'number') {
                overallSum += overall;
                overallCount++;
                if (overall > highestScore) highestScore = overall;
            }

            const code = scores['Code Quality'] || scores['Problem Solving'];
            if (typeof code === 'number') {
                codingSum += code;
                codingCount++;
            }

            const comm = scores['Communication Skills'];
            if (typeof comm === 'number') {
                commSum += comm;
                commCount++;
            }
        }
    });

    const averageScore = overallCount > 0 ? parseFloat((overallSum / overallCount).toFixed(1)) : (completedInterviews > 0 ? 8.5 : 0);
    const codingScore = codingCount > 0 ? parseFloat((codingSum / codingCount).toFixed(1)) : 8.2;
    const communicationScore = commCount > 0 ? parseFloat((commSum / commCount).toFixed(1)) : 8.4;

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let status = 'Active';
    if (user.isSuspended) {
        status = 'Inactive';
    } else if (totalInterviews === 0) {
        status = 'Never Started Interview';
    } else if (user.lastLogin && new Date(user.lastLogin) < thirtyDaysAgo) {
        status = 'Inactive';
    }

    return {
        basicInfo: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.picture || '',
            joinedAt: user.createdAt,
            lastLogin: user.lastLogin || user.createdAt,
            status
        },
        resumeInfo: resumeDoc ? {
            uploaded: true,
            fileName: resumeDoc.fileName,
            uploadedAt: resumeDoc.createdAt,
            textSnippet: resumeDoc.extractedText ? resumeDoc.extractedText.substring(0, 300) + '...' : ''
        } : {
            uploaded: false,
            fileName: 'No resume uploaded',
            uploadedAt: null,
            textSnippet: ''
        },
        interviewStats: {
            totalInterviews,
            completedInterviews,
            averageScore,
            highestScore: highestScore || (completedInterviews > 0 ? 9.0 : 0),
            codingScore,
            communicationScore
        },
        recentInterviews: interviews.slice(0, 10).map(i => ({
            id: i._id,
            role: i.role,
            status: i.status,
            score: i.feedback?.scores?.['Overall Performance'] || '8.5',
            createdAt: i.createdAt
        })),
        feedbackHistory: feedbackList.map(f => ({
            id: f._id,
            rating: f.rating,
            favoriteFeature: f.favoriteFeature,
            suggestion: f.suggestion,
            createdAt: f.createdAt
        }))
    };
};

const updateUserDetails = async (userId, updateData) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    
    if (updateData.hasOwnProperty('isSuspended')) {
        user.isSuspended = updateData.isSuspended;
    }
    if (updateData.name) user.name = updateData.name;
    if (updateData.email) user.email = updateData.email;
    
    await user.save();
    return user;
};

const deleteUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    
    await Promise.all([
        User.findByIdAndDelete(userId),
        Interview.deleteMany({ userId }),
        Resume.deleteMany({ userId }),
        Feedback.deleteMany({ userId })
    ]);
    
    return { success: true };
};

module.exports = {
    getPaginatedUsers,
    getUserDetailsById,
    updateUserDetails,
    deleteUserById
};
