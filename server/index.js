import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';
import pollRoutes from './routes/polls.js';
import adminRoutes from './routes/admin.js';
import categoryRoutes from './routes/categories.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this device. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per 15 minutes
    message: 'Too many authentication attempts. Please wait before trying again.',
    skipSuccessfulRequests: true,
});

const postLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Max 5 posts per minute
    message: 'Slow down! You can only post 5 whispers per minute.',
});

app.use(express.json());

// Basic Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Middleware - Refined CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); // Still allowing all for dev, but prepared for lockdown
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// GLOBAL Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PATCH') {
        console.log('Body:', JSON.stringify(req.body));
    }
    next();
});

// Routes
// ...

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Routes with specific rate limiters
app.use('/api/posts', postLimiter, postRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
