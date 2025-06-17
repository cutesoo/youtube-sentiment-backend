const Boom = require('@hapi/boom');
const { searchVideos, scrapeComments } = require('../utils/mlApi');
const VideoDetail = require('../models/VideoDetail');
const Comment = require('../models/Comment');

const searchYoutubeVideos = async (request, h) => {
    const { keyword } = request.query;

    console.log(`[VIDEO_CONTROLLER] INFO: Received search request for keyword: "${keyword}"`);

    if (!keyword) {
        console.error('[VIDEO_CONTROLLER] ERROR: Keyword is missing.');
        return Boom.badRequest('Keyword is required');
    }

    try {
        console.log('[VIDEO_CONTROLLER] INFO: Calling ML API searchVideos utility...');
        const mlApiResponse = await searchVideos(keyword);

        if (!mlApiResponse) {
            console.error('[VIDEO_CONTROLLER] ERROR: mlApiResponse adalah null atau undefined setelah memanggil searchVideos.');
            return Boom.badImplementation('Gagal mendapatkan respons dari ML API searchVideos.');
        }

        const videosToProcess = mlApiResponse; 

        if (!Array.isArray(videosToProcess)) {
            console.error('[VIDEO_CONTROLLER] ERROR: ML API tidak mengembalikan array di dalam properti "items". Data yang diterima:', mlApiResponse);
            return Boom.badImplementation('ML API mengembalikan format data yang tidak diharapkan untuk pencarian video (diharapkan array langsung)');
        }
        console.log(`[VIDEO_CONTROLLER] INFO: Menerima ${videosToProcess.length} video dari ML API.`);

        const simplifiedVideos = videosToProcess.map(video => {
            const thumbnailUrl = video.thumbnails?.high?.url || video.thumbnails?.default?.url || null;

            return {
                videoId: video.video_id,
                title: video.title,
                channelTitle: video.channel_title,
                publishedAt: video.published_at,
                thumbnails: thumbnailUrl
            };
        });

        console.log(`[VIDEO_CONTROLLER] INFO: Successfully simplified ${simplifiedVideos.length} videos.`);
        return h.response(simplifiedVideos).code(200);
    } catch (error) {
        console.error('[VIDEO_CONTROLLER] ERROR: Error di searchYoutubeVideos controller:');
        console.error(`  Pesan: ${error.message}`);
        console.error(`  Stack: ${error.stack}`);
        return Boom.badImplementation('Gagal mencari video YouTube');
    }
};

const analyzeYoutubeComments = async (request, h) => {
    const { videoId } = request.payload;

    if (!videoId) {
        return Boom.badRequest('Video ID is required');
    }

    try {
        let existingVideoDetail = await VideoDetail.findOne({ videoId });
        let existingComments = await Comment.find({ videoId });

        if (existingVideoDetail && existingComments.length > 0) {
            console.log(`Video ID ${videoId} and comments already exist. Fetching from DB.`);
            const sentimentSummary = await Comment.aggregate([
                { $match: { videoId: videoId } },
                { $group: { _id: '$sentiment', count: { $sum: 1 } } }
            ]);

            const summary = {
                positive: sentimentSummary.find(s => s._id === 'positif')?.count || 0,
                negative: sentimentSummary.find(s => s._id === 'negatif')?.count || 0,
                neutral: sentimentSummary.find(s => s._id === 'netral')?.count || 0,
                total: existingComments.length
            };

            existingVideoDetail.sentimentSummary = summary;
            existingVideoDetail.totalCommentsAnalyzed = existingComments.length;
            await existingVideoDetail.save();

            return h.response({
                videoDetails: existingVideoDetail,
                comments: existingComments,
                sentimentSummary: summary
            }).code(200);
        }

        const mlResponse = await scrapeComments(videoId);

        if (!mlResponse || !mlResponse.comments || !mlResponse.video_details) {
            return Boom.badImplementation('ML API response is incomplete');
        }

        const { comments, video_details } = mlResponse;

        const newVideoDetail = new VideoDetail({
            ...video_details,
            videoId: video_details.video_id,
            published_at: new Date(video_details.published_at),
            analysisDate: new Date()
        });
        await newVideoDetail.save();

        const commentsToInsert = comments.map(c => ({
            cleaned: c.Cleaned,
            comment: c.Comment,
            date: new Date(c.Date),
            sentiment: c.Sentiment,
            timestamp: new Date(c.Timestamp),
            username: c.Username,
            videoId: c.VideoID
        }));
        await Comment.insertMany(commentsToInsert);

        const sentimentSummary = await Comment.aggregate([
            { $match: { videoId: videoId } },
            { $group: { _id: '$sentiment', count: { $sum: 1 } } }
        ]);

        const summary = {
            positive: sentimentSummary.find(s => s._id === 'positif')?.count || 0,
            negative: sentimentSummary.find(s => s._id === 'negatif')?.count || 0,
            neutral: sentimentSummary.find(s => s._id === 'netral')?.count || 0,
            total: commentsToInsert.length
        };

        newVideoDetail.sentimentSummary = summary;
        newVideoDetail.totalCommentsAnalyzed = commentsToInsert.length;
        await newVideoDetail.save();

        return h.response({
            videoDetails: newVideoDetail,
            comments: commentsToInsert,
            sentimentSummary: summary
        }).code(200);

    } catch (error) {
        console.error('Error in analyzeYoutubeComments:', error.message);
        console.error('Stack:', error.stack);
        return Boom.badImplementation('Failed to analyze YouTube comments');
    }
};

module.exports = {
    searchYoutubeVideos,
    analyzeYoutubeComments
};