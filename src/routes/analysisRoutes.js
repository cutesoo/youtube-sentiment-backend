const Joi = require('joi');
const {
    getAnalysisHistory,
    getAnalysisDetail,
    updateRecommendations,
    exportAnalysisToPdf,
    exportAnalysisToCsv
} = require('../controllers/analysisController');

const analysisRoutes = [
    {
        method: 'GET',
        path: '/analysis/history',
        options: {
            auth: 'jwt', 
            description: 'Get list of all analyzed video histories',
            tags: ['api', 'analysis']
        },
        handler: getAnalysisHistory
    },
    {
        method: 'GET',
        path: '/analysis/{videoId}',
        options: {
            auth: 'jwt', 
            validate: {
                params: Joi.object({
                    videoId: Joi.string().required()
                })
            },
            description: 'Get detailed analysis for a specific video',
            tags: ['api', 'analysis']
        },
        handler: getAnalysisDetail
    },
    {
        method: 'PUT',
        path: '/analysis/{videoId}/recommendations',
        options: {
            auth: 'jwt', 
            validate: {
                params: Joi.object({
                    videoId: Joi.string().required()
                }),
                payload: Joi.object({
                    recommendations: Joi.string().allow('').optional() 
                })
            },
            description: 'Update recommendations/notes for an analysis',
            tags: ['api', 'analysis']
        },
        handler: updateRecommendations
    },
    {
        method: 'GET',
        path: '/analysis/{videoId}/export/pdf',
        options: {
            auth: 'jwt', 
            validate: {
                params: Joi.object({
                    videoId: Joi.string().required()
                })
            },
            description: 'Export analysis report to PDF',
            tags: ['api', 'analysis']
        },
        handler: exportAnalysisToPdf
    },
    {
        method: 'GET',
        path: '/analysis/{videoId}/export/csv',
        options: {
            auth: 'jwt', 
            validate: {
                params: Joi.object({
                    videoId: Joi.string().required()
                })
            },
            description: 'Export comments data to CSV',
            tags: ['api', 'analysis']
        },
        handler: exportAnalysisToCsv
    }
];

module.exports = analysisRoutes;