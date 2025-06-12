const Boom = require('@hapi/boom');
const VideoDetail = require('../models/VideoDetail');
const Comment = require('../models/Comment');
const PDFDocument = require('pdfkit'); 
const { stringify } = require('csv-stringify'); 

const getAnalysisHistory = async (request, h) => {
    try {
        const histories = await VideoDetail.find({})
                                        .select('videoId title channelTitle analysisDate totalCommentsAnalyzed sentimentSummary') 
                                        .sort({ analysisDate: -1 }); 

        return h.response(histories).code(200);
    } catch (error) {
        console.error('Error fetching analysis history:', error);
        return Boom.badImplementation('Failed to fetch analysis history');
    }
};

const getAnalysisDetail = async (request, h) => {
    const { videoId } = request.params;

    try {
        const videoDetail = await VideoDetail.findOne({ videoId });
        if (!videoDetail) {
            return Boom.notFound('Analysis detail not found for this video ID');
        }

        const comments = await Comment.find({ videoId }).sort({ date: 1 });

        const sentimentSummary = {
            positive: videoDetail.sentimentSummary.positive,
            negative: videoDetail.sentimentSummary.negative,
            neutral: videoDetail.sentimentSummary.neutral,
            total: videoDetail.totalCommentsAnalyzed
        };

        const wordFrequencies = {};
        comments.forEach(c => {
            const words = c.cleaned ? c.cleaned.toLowerCase().match(/\b\w+\b/g) : [];
            words.forEach(word => {
                if (!['yang', 'dan', 'atau', 'di', 'ke', 'dari', 'ini', 'itu', 'nya', 'untuk', 'dengan', 'saya', 'tidak', 'ada', 'saja'].includes(word)) {
                    if (!wordFrequencies[word]) {
                        wordFrequencies[word] = { count: 0, sentiments: { positif: 0, negatif: 0, netral: 0 } };
                    }
                    wordFrequencies[word].count++;
                    if (c.sentiment && wordFrequencies[word].sentiments[c.sentiment]) {
                        wordFrequencies[word].sentiments[c.sentiment]++;
                    }
                }
            });
        });

        const wordCloudData = Object.keys(wordFrequencies).map(word => ({
            text: word,
            size: wordFrequencies[word].count, 
            sentiment: Object.keys(wordFrequencies[word].sentiments).reduce((a, b) => wordFrequencies[word].sentiments[a] > wordFrequencies[word].sentiments[b] ? a : b) 
        })).sort((a, b) => b.size - a.size).slice(0, 100); 

        return h.response({
            videoDetails: videoDetail,
            comments: comments, 
            sentimentSummary,
            wordCloudData,
            recommendations: videoDetail.recommendations || null
        }).code(200);
    } catch (error) {
        console.error('Error fetching analysis detail:', error);
        return Boom.badImplementation('Failed to fetch analysis detail');
    }
};

const updateRecommendations = async (request, h) => {
    const { videoId } = request.params;
    const { recommendations } = request.payload;

    try {
        const videoDetail = await VideoDetail.findOneAndUpdate(
            { videoId },
            { $set: { recommendations } },
            { new: true } 
        );

        if (!videoDetail) {
            return Boom.notFound('Analysis detail not found for this video ID');
        }

        return h.response({ message: 'Recommendations updated successfully', videoDetail }).code(200);
    } catch (error) {
        console.error('Error updating recommendations:', error);
        return Boom.badImplementation('Failed to update recommendations');
    }
};

const exportAnalysisToPdf = async (request, h) => {
    const { videoId } = request.params;

    try {
        const videoDetail = await VideoDetail.findOne({ videoId });
        if (!videoDetail) {
            return Boom.notFound('Analysis detail not found');
        }

        const comments = await Comment.find({ videoId });

        const doc = new PDFDocument();
        const filename = `analysis_report_${videoId}.pdf`;

        h.response(doc).header('Content-Disposition', `attachment; filename="${filename}"`).header('Content-Type', 'application/pdf');

        doc.fontSize(20).text('YouTube Comment Sentiment Analysis Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(16).text('Video Details:');
        doc.fontSize(12).text(`Title: ${videoDetail.title}`);
        doc.text(`Channel: ${videoDetail.channel_title}`);
        doc.text(`Published At: ${videoDetail.published_at.toDateString()}`);
        doc.text(`Total Comments Analyzed: ${videoDetail.totalCommentsAnalyzed}`);
        doc.moveDown();

        doc.fontSize(16).text('Sentiment Summary:');
        doc.fontSize(12).text(`Positive: ${videoDetail.sentimentSummary.positive}`);
        doc.text(`Negative: ${videoDetail.sentimentSummary.negative}`);
        doc.text(`Neutral: ${videoDetail.sentimentSummary.neutral}`);
        doc.moveDown();

        if (videoDetail.recommendations) {
            doc.fontSize(16).text('Recommendations/Notes:');
            doc.fontSize(12).text(videoDetail.recommendations);
            doc.moveDown();
        }

        doc.fontSize(16).text('Sample Comments (first 10):');
        comments.slice(0, 10).forEach((comment, index) => {
            doc.fontSize(10).text(`${index + 1}. [${comment.sentiment.toUpperCase()}] ${comment.username}: ${comment.comment}`);
        });

        doc.end();

        return doc; 
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        return Boom.badImplementation('Failed to export report to PDF');
    }
};

const exportAnalysisToCsv = async (request, h) => {
    const { videoId } = request.params;

    try {
        const comments = await Comment.find({ videoId }).lean(); 
        if (!comments || comments.length === 0) {
            return Boom.notFound('No comments found for this video ID');
        }

        const columns = [
            { key: 'username', header: 'Username' },
            { key: 'comment', header: 'Comment' },
            { key: 'sentiment', header: 'Sentiment' },
            { key: 'date', header: 'Date' }
        ];

        const filename = `comments_report_${videoId}.csv`;
        const stringifier = stringify({ header: true, columns: columns });

        comments.forEach(comment => {
            stringifier.write({
                username: comment.username,
                comment: comment.comment,
                sentiment: comment.sentiment,
                date: comment.date ? comment.date.toISOString() : ''
            });
        });
        stringifier.end();

        return h.response(stringifier)
                .header('Content-Disposition', `attachment; filename="${filename}"`)
                .header('Content-Type', 'text/csv');

    } catch (error) {
        console.error('Error exporting to CSV:', error);
        return Boom.badImplementation('Failed to export report to CSV');
    }
};


module.exports = {
    getAnalysisHistory,
    getAnalysisDetail,
    updateRecommendations,
    exportAnalysisToPdf,
    exportAnalysisToCsv
};