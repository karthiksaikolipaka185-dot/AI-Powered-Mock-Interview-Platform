const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    favoriteFeature: {
        type: String,
        required: true
    },
    suggestion: {
        type: String,
        default: ''
    },
    reviewStatus: {
        type: String,
        enum: ['Pending', 'Reviewed'],
        default: 'Pending'
    },
    sentiment: {
        type: String,
        enum: ['Positive', 'Neutral', 'Negative'],
        default: 'Positive'
    },
    summary: {
        type: String,
        default: ''
    },
    deviceInfo: {
        type: String,
        default: 'Desktop Web Browser'
    },
    browserInfo: {
        type: String,
        default: 'Chrome / Edge Client'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
