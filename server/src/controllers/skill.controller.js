const skillService = require('../services/skill.service');
const Interview = require('../models/Interview.model');

const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const data = await skillService.getSkillProfileByUserId(userId);
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error('Error fetching skill profile:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve skill profile',
            error: err.message
        });
    }
};

const recalculateProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const completedInterviews = await Interview.find({ userId, status: 'completed' }).sort({ createdAt: 1 });
        let updatedProfile = null;

        for (const interview of completedInterviews) {
            updatedProfile = await skillService.updateSkillProfileFromInterview(userId, interview);
        }

        const data = await skillService.getSkillProfileByUserId(userId);
        return res.status(200).json({
            success: true,
            message: `Recalculated skill profile across ${completedInterviews.length} completed interviews`,
            data
        });
    } catch (err) {
        console.error('Error recalculating skill profile:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to recalculate skill profile',
            error: err.message
        });
    }
};

module.exports = {
    getProfile,
    recalculateProfile
};
