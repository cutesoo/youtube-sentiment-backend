const Joi = require('joi'); 
const { registerUser, loginUser } = require('../controllers/authController');

const authRoutes = [
    {
        method: 'POST',
        path: '/register',
        options: {
            auth: false, 
            validate: {
                payload: Joi.object({
                    username: Joi.string().min(3).max(30).required(),
                    password: Joi.string().min(6).required(),
                    role: Joi.string().valid('user', 'admin').default('user')
                })
            },
            description: 'Register a new user',
            tags: ['api', 'auth']
        },
        handler: registerUser
    },
    {
        method: 'POST',
        path: '/login',
        options: {
            auth: false, 
            validate: {
                payload: Joi.object({
                    username: Joi.string().required(),
                    password: Joi.string().required()
                })
            },
            description: 'Login an existing user',
            tags: ['api', 'auth']
        },
        handler: loginUser
    }
];

module.exports = authRoutes;