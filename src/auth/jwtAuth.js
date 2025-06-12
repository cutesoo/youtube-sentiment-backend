const { decodeToken } = require('../utils/jwt');
const User = require('../models/User'); 
 const jwtAuthPlugin = {
name: 'jwt-auth',
version: '1.0.0',
register: async (server, options) => {
await server.register(require('@hapi/jwt'));

        server.auth.strategy('jwt', 'jwt', {
            keys: process.env.JWT_SECRET,
            verify: {
                aud: false,
                iss: false,
                sub: false,
                nbf: false,
                exp: true,
                maxAgeSec: 3600, 
                timeSkewSec: 15
            },
            validate: async (artifacts, request, h) => {
                try {
                    const user = await User.findById(artifacts.decoded.payload.id);
                    if (!user) {
                        return { isValid: false };
                    }
                    return {
                        isValid: true,
                        credentials: {
                            id: user._id,
                            username: user.username,
                            role: user.role
                        }
                    };
                } catch (error) {
                    console.error('JWT validation error:', error);
                    return { isValid: false };
                }
            }
        });

        server.auth.default('jwt');
    }
};

module.exports = jwtAuthPlugin;
