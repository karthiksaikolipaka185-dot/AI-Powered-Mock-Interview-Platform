const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        required: true
    },
    questions: {
        type: Array,
        default: []
    },
    messages: {
        type: Array,
        default: []
    },
    codeSubmissions: {
        type: Array,
        default: []
    },
    feedback: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    lastAudio: {
        type: String,
        default: ''
    },
    initialDifficulty: {
        type: String,
        default: 'Medium'
    },
    currentDifficulty: {
        type: String,
        default: 'Medium'
    },
    totalQuestions: {
        type: Number,
        default: 5
    },
    blueprint: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    performanceTracker: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({
            strengths: [],
            weaknesses: [],
            categoryScores: {},
            overallAverage: 0,
            answerCount: 0
        })
    },
    evaluations: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'completed']
    }
}, {
    timestamps: true
});

const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);

module.exports = Interview;
