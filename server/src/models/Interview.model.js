const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        default: null
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
    codingProblemId: {
        type: String,
        default: null
    },
    codingProblemDifficulty: {
        type: String,
        default: null
    },
    codingCurrentCode: {
        type: String,
        default: ''
    },
    codingLanguage: {
        type: String,
        default: 'python'
    },
    codingSubmitted: {
        type: Boolean,
        default: false
    },
    codingEvaluationSummary: {
        totalTests: Number,
        passed: Number,
        failed: Number,
        status: {
            type: String,
            default: null
        },
        error: String
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
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    currentDifficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    topicsCovered: [{
        type: String
    }],
    totalQuestions: {
        type: Number,
        default: 5
    },
    blueprint: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    performanceTracker: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({
            recentScores: [],
            averageScore: 0,
            weakAreas: [],
            strongAreas: [],
            totalAnswered: 0,
            codingScore: null,
            codingStatus: null,
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
    evidenceValidations: {
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
