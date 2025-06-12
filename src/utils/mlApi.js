const axios = require('axios');

const ML_API_SEARCH_VIDEOS = process.env.ML_API_SEARCH_VIDEOS;
const ML_API_SCRAPE_COMMENTS = process.env.ML_API_SCRAPE_COMMENTS;

const searchVideos = async (keyword) => {
    console.log(`[ML_API] INFO: Calling search_videos with keyword: "${keyword}"`);
    console.log(`[ML_API] INFO: search_videos URL: ${ML_API_SEARCH_VIDEOS}`);
    try {
        const response = await axios.post(ML_API_SEARCH_VIDEOS, {
            query: keyword
        }, {
            timeout: 15000
        });

        console.log(`[ML_API] SUCCESS: search_videos response status: ${response.status}`);
        console.log(`[ML_API] INFO: search_videos response data type: ${typeof response.data}`);
        if (response.data && Array.isArray(response.data)) {
            console.log(`[ML_API] INFO: search_videos received ${response.data.length} items.`);
        } else {
            console.log(`[ML_API] WARNING: search_videos received non-array data:`, response.data);
        }
        return response.data;
    } catch (error) {
        console.error('[ML_API] ERROR: Failed to search videos from ML API:');
        console.error(`  Message: ${error.message}`);
        if (error.response) {
            console.error(`  Status: ${error.response.status}`);
            console.error(`  Data:`, error.response.data);
        } else if (error.request) {
            console.error(`  No response received. Request details:`, error.request);
        } else {
            console.error(`  Error in request setup:`, error.message);
        }
        console.error(`  Stack: ${error.stack}`);
        throw new Error('Failed to search videos from ML API');
    }
};

const scrapeComments = async (videoId) => {
    console.log(`[ML_API] INFO: Calling scrape_comments for video ID: "${videoId}"`);
    console.log(`[ML_API] INFO: scrape_comments URL: ${ML_API_SCRAPE_COMMENTS}`);
    try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        console.log(`[ML_API] INFO: Sending video_url: ${videoUrl}`); 
        const response = await axios.post(ML_API_SCRAPE_COMMENTS, {
            video_url: videoUrl 
        }, {
            timeout: 30000 
        });

        console.log(`[ML_API] SUCCESS: scrape_comments response status: ${response.status}`);
        console.log(`[ML_API] INFO: scrape_comments response data keys: ${Object.keys(response.data || {})}`);
        return response.data;
    } catch (error) {
        console.error('[ML_API] ERROR: Failed to scrape comments from ML API:');
        console.error(`  Message: ${error.message}`);
        if (error.response) {
            console.error(`  Status: ${error.response.status}`); 
            console.error(`  Data:`, error.response.data);
        } else if (error.request) {
            console.error(`  No response received. Request details:`, error.request);
        } else {
            console.error(`  Error in request setup:`, error.message);
        }
        console.error(`  Stack: ${error.stack}`);
        throw new Error('Failed to scrape comments from ML API');
    }
};

module.exports = { searchVideos, scrapeComments };