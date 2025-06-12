const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const Boom = require('@hapi/boom');

const registerUser = async (request, h) => {
    const { username, password, role } = request.payload;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return Boom.conflict('Username already exists');
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new User({ username, password: hashedPassword, role: role || 'user' });
        await newUser.save();

        return h.response({ message: 'User registered successfully', userId: newUser._id }).code(201);
    } catch (error) {
        console.error('Error during user registration:', error);
        return Boom.badImplementation('Internal server error');
    }
};

const loginUser = async (request, h) => {
    const { username, password } = request.payload;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return Boom.unauthorized('Invalid username or password');
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return Boom.unauthorized('Invalid username or password');
        }

        const token = generateToken({ id: user._id, username: user.username, role: user.role });

        return h.response({ message: 'Login successful', token, role: user.role }).code(200);
    } catch (error) {
        console.error('Error during user login:', error);
        return Boom.badImplementation('Internal server error');
    }
};

module.exports = {
    registerUser,
    loginUser
};