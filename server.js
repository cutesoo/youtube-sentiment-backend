require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Boom = require('@hapi/boom'); 
const connectDB = require('./src/config/db');
const jwtAuthPlugin = require('./src/auth/jwtAuth');

const authRoutes = require('./src/routes/authRoutes');
const videoRoutes = require('./src/routes/videoRoutes');
const analysisRoutes = require('./src/routes/analysisRoutes');
const userRoutes = require('./src/routes/userRoutes');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Authorization', 'Content-Type', 'Accept'],
                additionalHeaders: ['X-Requested-With'],
                credentials: true
            }
        }
    });

    await server.register([
        Inert,
        jwtAuthPlugin,
    ]);

    await connectDB();

    server.route([
        ...authRoutes,
        ...videoRoutes,
        ...analysisRoutes,
        ...userRoutes 
    ]);

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: false
        },
        handler: (request, h) => {
            return 'YouTube Sentiment Analysis Backend is running!';
        }
    });

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

init();