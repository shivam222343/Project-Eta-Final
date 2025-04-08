import UserModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';

export const createUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userService.createUser(req.body);
        const token = user.generateJWT();

        delete user._doc.password;

        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = user.generateJWT();

        delete user._doc.password;

        res.status(200).json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

export const profileController = async (req, res) => {
    try {
        const cacheKey = `user:profile:${req.user.id}`;
        
        // Try to get cached profile
        const cachedProfile = await redisClient.get(cacheKey);
        if (cachedProfile) {
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedProfile),
                meta: { source: 'cache' }
            });
        }

        // Fetch from database with additional processing
        const user = await UserModel.findById(req.user.id)
            .select('-password -__v')
            .populate({
                path: 'projects',
                select: 'name description createdAt',
                options: { limit: 3, sort: { createdAt: -1 } }
            })
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Process profile data
        const profileData = {
            ...user,
            statistics: {
                projectCount: user.projects?.length || 0,
                accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
            },
            meta: {
                lastActive: user.lastActive || 'Never',
                accountCreated: user.createdAt
            }
        };

        // Cache the processed data for 1 hour
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(profileData));

        res.status(200).json({
            success: true,
            data: profileData,
            meta: { source: 'database' }
        });

    } catch (error) {
        console.error('[ProfileController] Error:', error);
        
        const response = {
            success: false,
            error: 'Failed to fetch profile data',
            code: 'PROFILE_FETCH_ERROR'
        };

        if (process.env.NODE_ENV === 'development') {
            response.stack = error.stack;
            response.details = error.message;
        }

        res.status(500).json(response);
    }
};

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).json({ error: 'Token not provided' });
        }

        await redisClient.setEx(token, 24 * 60 * 60, 'logout'); // Set token in Redis with 24h expiration

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await UserModel.findOne({ email: req.user.email });

        if (!loggedInUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        res.status(200).json({ users: allUsers });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};