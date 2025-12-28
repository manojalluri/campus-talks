import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Poll from '../models/Poll.js';
import Category from '../models/Category.js';
import Config from '../models/Config.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = express.Router();
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Middleware to check if admin
const isAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized as admin' });
        }
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Route to change admin password
router.post('/update-password', isAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 1. Get current password from DB or ENV
        let dbConfig = await Config.findOne({ key: 'admin_password' });

        let isMatch = false;
        if (dbConfig) {
            isMatch = await bcrypt.compare(currentPassword, dbConfig.value);
        } else {
            isMatch = (currentPassword === process.env.ADMIN_PASSWORD);
        }

        // 2. Verify current password
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // 3. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update password
        if (dbConfig) {
            dbConfig.value = hashedNewPassword;
            await dbConfig.save();
        } else {
            dbConfig = new Config({ key: 'admin_password', value: hashedNewPassword });
            await dbConfig.save();
        }

        res.json({ message: 'Admin password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Admin Stats
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const postCount = await Post.countDocuments();
        const pollCount = await Poll.countDocuments();
        const reportedCount = await Post.countDocuments({ reports: { $gt: 0 } });

        // Active in last 24h
        const active24h = await User.countDocuments({
            lastActive: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        res.json({
            users: userCount,
            posts: postCount,
            polls: pollCount,
            reported: reportedCount,
            activeNow: active24h
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get All Users (with search and activity stats)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            const safeSearch = escapeRegex(search);
            query = {
                $or: [
                    { username: { $regex: safeSearch, $options: 'i' } },
                    { email: { $regex: safeSearch, $options: 'i' } }
                ]
            };
        }
        const users = await User.find(query).select('-password').sort({ lastActive: -1 }).lean();

        const usersWithStats = await Promise.all(users.map(async (user) => {
            const userHash = crypto.createHash('sha256').update(user._id.toString()).digest('hex');
            const postCount = await Post.countDocuments({ userHash });
            return {
                ...user,
                postCount,
                status: (new Date() - new Date(user.lastActive)) < 300000 ? 'online' : 'away'
            };
        }));

        res.json(usersWithStats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle Ban
router.post('/users/:id/ban', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, isBanned: user.isBanned });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Reported Posts
router.get('/reported', isAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        let query = { reports: { $gt: 0 } };
        if (search) {
            query.content = { $regex: escapeRegex(search), $options: 'i' };
        }
        const posts = await Post.find(query).sort({ reports: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get All Polls
router.get('/polls', isAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query.question = { $regex: escapeRegex(search), $options: 'i' };
        }
        const polls = await Poll.find(query).sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete User Permanently
router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User record erased' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Post
router.delete('/posts/:id', isAdmin, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post removed by authority' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Poll
router.delete('/polls/:id', isAdmin, async (req, res) => {
    try {
        await Poll.findByIdAndDelete(req.params.id);
        res.json({ message: 'Poll removed by authority' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Categories Management
router.get('/categories', isAdmin, async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/categories', isAdmin, async (req, res) => {
    try {
        const { id, label, icon, order } = req.body;
        const category = new Category({ id, label, icon, order });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/categories/:id', isAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/categories/:id', isAdmin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
