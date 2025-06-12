const Joi = require('joi');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

const userRoutes = [
    {
        method: 'GET',
        path: '/users',
        options: {
            auth: 'jwt', 
            pre: [{ method: (request, h) => {
                if (request.auth.credentials.role !== 'admin') {
                    return Boom.forbidden('Only administrators can access user control');
                }
                return h.continue;
            }, assign: 'isAdmin' }],
            description: 'Get all users (Admin only)',
            tags: ['api', 'admin', 'users']
        },
        handler: getAllUsers
    },
    {
        method: 'GET',
        path: '/users/{id}',
        options: {
            auth: 'jwt', 
            pre: [{ method: (request, h) => {
                if (request.auth.credentials.role !== 'admin') {
                    return Boom.forbidden('Only administrators can access user control');
                }
                return h.continue;
            }, assign: 'isAdmin' }],
            validate: {
                params: Joi.object({
                    id: Joi.string().required()
                })
            },
            description: 'Get user by ID (Admin only)',
            tags: ['api', 'admin', 'users']
        },
        handler: getUserById
    },
    {
        method: 'POST',
        path: '/users',
        options: {
            auth: 'jwt',
            pre: [{ method: (request, h) => {
                if (request.auth.credentials.role !== 'admin') {
                    return Boom.forbidden('Only administrators can create users');
                }
                return h.continue;
            }, assign: 'isAdmin' }],
            validate: {
                payload: Joi.object({
                    username: Joi.string().min(3).max(30).required(),
                    password: Joi.string().min(6).required(),
                    role: Joi.string().valid('user', 'admin').default('user')
                })
            },
            description: 'Create a new user (Admin only)',
            tags: ['api', 'admin', 'users']
        },
        handler: createUser
    },
    {
        method: 'PUT',
        path: '/users/{id}',
        options: {
            auth: 'jwt', 
            pre: [{ method: (request, h) => {
                if (request.auth.credentials.role !== 'admin') {
                    return Boom.forbidden('Only administrators can update users');
                }
                return h.continue;
            }, assign: 'isAdmin' }],
            validate: {
                params: Joi.object({
                    id: Joi.string().required()
                }),
                payload: Joi.object({
                    username: Joi.string().min(3).max(30).optional(),
                    password: Joi.string().min(6).optional(),
                    role: Joi.string().valid('user', 'admin').optional()
                }).min(1) 
            },
            description: 'Update user by ID (Admin only)',
            tags: ['api', 'admin', 'users']
        },
        handler: updateUser
    },
    {
        method: 'DELETE',
        path: '/users/{id}',
        options: {
            auth: 'jwt', 
            pre: [{ method: (request, h) => {
                if (request.auth.credentials.role !== 'admin') {
                    return Boom.forbidden('Only administrators can delete users');
                }
                return h.continue;
            }, assign: 'isAdmin' }],
            validate: {
                params: Joi.object({
                    id: Joi.string().required()
                })
            },
            description: 'Delete user by ID (Admin only)',
            tags: ['api', 'admin', 'users']
        },
        handler: deleteUser
    }
];

module.exports = userRoutes;