const mongoose = require('mongoose');

const skillProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    targetRole: {
        type: String,
        default: 'Full Stack Engineer'
    },
    skills: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    overallMetrics: {
        totalInterviewsCompleted: { type: Number, default: 0 },
        overallAverageScore: { type: Number, default: 0 },
        strongestSkill: { type: String, default: '' },
        weakestSkill: { type: String, default: '' },
        lastCalculatedAt: { type: Date, default: Date.now }
    }
}, { timestamps: true });

const SkillProfile = mongoose.models.SkillProfile || mongoose.model('SkillProfile', skillProfileSchema);

module.exports = SkillProfile;
