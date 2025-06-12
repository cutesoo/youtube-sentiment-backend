const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    cleaned: { type: String },
    comment: { type: String, required: true },
    date: { type: Date }, 
    sentiment: {
        type: String,
        enum: ['positif', 'negatif', 'netral', 'unknown'], 
        default: 'unknown'
    },
    timestamp: { type: Date }, 
    username: { type: String },
    videoId: {
        type: String,
        required: true,
        index: true 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', CommentSchema);