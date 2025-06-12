const Boom = require('@hapi/boom');
const User = require('../models/User');
const { hashPassword } = require('../utils/bcrypt');

const checkAdminRole = (request, h) => {
    if (request.auth.credentials.role !== 'admin') {
        return Boom.forbidden('Only administrators can perform this action');
    }
    return true; 
};

const getAllUsers = async (request, h) => {
    if (checkAdminRole(request, h) !== true) return checkAdminRole(request, h);
    try {
        const users = await User.find().select('-password'); 
        return h.response(users).code(200);
    } catch (error) {
        console.error('Error fetching all users:', error);
        return Boom.badImplementation('Failed to fetch users');
    }
};

const getUserById = async (request, h) => {
    if (checkAdminRole(request, h) !== true) return checkAdminRole(request, h);
    const { id } = request.params;
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return Boom.notFound('User not found');
        }
        return h.response(user).code(200);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return Boom.badImplementation('Failed to fetch user');
    }
};

const createUser = async (request, h) => {
    if (checkAdminRole(request, h) !== true) return checkAdminRole(request, h);
    const { username, password, role } = request.payload;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return Boom.conflict('Username already exists');
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new User({ username, password: hashedPassword, role: role || 'user' });
        await newUser.save();

        return h.response({ message: 'User created successfully', userId: newUser._id }).code(201);
    } catch (error) {
        console.error('Error creating user:', error);
        return Boom.badImplementation('Failed to create user');
    }
};

const updateUser = async (request, h) => {
    if (checkAdminRole(request, h) !== true) return checkAdminRole(request, h);
    const { id } = request.params;
    const { username, password, role } = request.payload;

    try {
        const updateFields = {};
        if (username) updateFields.username = username;
        if (password) updateFields.password = await hashPassword(password); 
        if (role) updateFields.role = role;

        const updatedUser = await User.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select('-password');

        if (!updatedUser) {
            return Boom.notFound('User not found');
        }

        return h.response({ message: 'User updated successfully', user: updatedUser }).code(200);
    } catch (error) {
        console.error('Error updating user:', error);
        return Boom.badImplementation('Failed to update user');
    }
};

const deleteUser = async (request, h) => {
    if (checkAdminRole(request, h) !== true) return checkAdminRole(request, h);
    const { id } = request.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return Boom.notFound('User not found');
        }

        return h.response({ message: 'User deleted successfully' }).code(200);
    } catch (error) {
        console.error('Error deleting user:', error);
        return Boom.badImplementation('Failed to delete user');
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};