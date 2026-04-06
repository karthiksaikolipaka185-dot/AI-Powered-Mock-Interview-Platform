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
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'completed']
    }
}, {
    timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
