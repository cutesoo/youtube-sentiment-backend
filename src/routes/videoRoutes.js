const Joi = require('joi');
const { searchYoutubeVideos, analyzeYoutubeComments } = require('../controllers/videoController');

const videoRoutes = [
    {
        method: 'GET',
        path: '/videos/search',
        options: {
            auth: 'jwt', 
            validate: {
                query: Joi.object({
                    keyword: Joi.string().min(1).required()
                })
            },
            description: 'Search YouTube videos by keyword',
            tags: ['api', 'video']
        },
        handler: searchYoutubeVideos
    },
    {
        method: 'POST',
        path: '/videos/analyze',
        options: {
            auth: 'jwt', 
            validate: {
                payload: Joi.object({
                    videoId: Joi.string().required()
                })
            },
            description: 'Scrape and analyze comments for a given YouTube video ID',
            tags: ['api', 'video']
        },
        handler: analyzeYoutubeComments
    }
];

module.exports = videoRoutes;