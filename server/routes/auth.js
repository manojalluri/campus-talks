import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Config from '../models/Config.js';
import auth from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Register
router.post('/signup', async (req, res) => {
    console.log('Signup Attempt:', req.body);
    try {
        const { username, email, password, avatar } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // Clean username (enforce handle style)
        const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_.]/g, '');

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username: cleanUsername }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Campus ID or Email already taken' });
        }

        const user = new User({
            username: cleanUsername,
            email,
            password,
            avatar,
            lastActive: new Date()
        });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been suspended for violating guidelines' });
        }

        // Update last active
        user.lastActive = new Date();
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
    const { password } = req.body;
    console.log('Admin Login Attempt...');

    try {
        // Check Config DB first for custom password
        let dbConfig = await Config.findOne({ key: 'admin_password' });

        if (dbConfig) {
            // Case 1: Custom password in DB exists
            let isMatch = false;

            if (dbConfig.value.startsWith('$2')) {
                isMatch = await bcrypt.compare(password, dbConfig.value);
            } else if (password === dbConfig.value) {
                // Legacy plain text check - only once then upgrade
                isMatch = true;
                const salt = await bcrypt.genSalt(10);
                dbConfig.value = await bcrypt.hash(password, salt);
                await dbConfig.save();
            }

            if (isMatch) {
                const token = jwt.sign({ role: 'admin', sub: 'root_admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
                return res.json({ token, admin: true });
            }
        } else {
            // ENV Fallback
            if (password && password.trim() === process.env.ADMIN_PASSWORD) {
                const token = jwt.sign({ role: 'admin', sub: 'root_admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
                return res.json({ token, admin: true });
            }
        }

        res.status(401).json({ message: 'Authentication failed: unauthorized access' });
    } catch (err) {
        console.error('Admin Login Error:', err);
        res.status(500).json({ message: 'Internal security error during authentication' });
    }
});

// Update display name
router.put('/update-username', auth, async (req, res) => {
    try {
        const { username } = req.body;
        if (!username || username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters' });
        }

        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== req.user.id) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username: username.toLowerCase() },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
