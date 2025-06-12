const mongoose = require('mongoose');

const VideoDetailSchema = mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true,
        index: true 
    },
    caption: { type: String },
    category_id: { type: String },
    channel_id: { type: String },
    channel_title: { type: String },
    comment_count: { type: String }, 
    definition: { type: String },
    description: { type: String },
    duration: { type: String },
    embed_html: { type: String },
    like_count: { type: String }, 
    privacy_status: { type: String },
    published_at: { type: Date }, 
    tags: [{ type: String }],
    thumbnails: {
        default: { url: String, width: Number, height: Number },
        high: { url: String, width: Number, height: Number },
        maxres: { url: String, width: Number, height: Number },
        medium: { url: String, width: Number, height: Number }, 
        standard: { url: String, width: Number, height: Number } 
    },
    title: { type: String },
    view_count: { type: String }, 
    analysisDate: {
        type: Date,
        default: Date.now
    },
    totalCommentsAnalyzed: {
        type: Number,
        default: 0
    },
    sentimentSummary: {
        positive: { type: Number, default: 0 },
        negative: { type: Number, default: 0 },
        neutral: { type: Number, default: 0 }
    },
    recommendations: {
        type: String
    }
});

module.exports = mongoose.model('VideoDetail', VideoDetailSchema);