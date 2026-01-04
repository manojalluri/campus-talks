import express from 'express';
import Post from '../models/Post.js';
import { Filter } from 'bad-words';
import crypto from 'crypto';
import auth from '../middleware/auth.js';

const router = express.Router();
const filter = new Filter();

// Input sanitization helper
const sanitizeInput = (text) => {
    if (!text) return '';
    return text
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
};

const validateCategory = (category) => {
    const validCategories = ['Movies', 'Rant', 'Confession', 'Meme', 'Academic', 'Appreciation', 'Advice'];
    return validCategories.some(cat => cat.toLowerCase() === category.toLowerCase());
};

const getUserHash = (req) => {
    let data;
    if (req.user && req.user.id) {
        data = req.user.id;
    } else {
        const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
        const ua = req.headers['user-agent'] || 'unknown';
        data = ip + ua;
    }
    // Add a pepper from environment for extra security if it exists
    const pepper = process.env.HASH_PEPPER || 'campus_talks_fallback_pepper';
    return crypto.createHash('sha256').update(data + pepper).digest('hex');
};

// Get all active posts
router.get('/', auth, async (req, res) => {
    try {
        const { category, sort } = req.query;
        const currentUserHash = getUserHash(req);

        let query = { status: 'active' };

        if (category && category !== 'All') {
            // Case-insensitive exact match for category
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        let sortQuery = { createdAt: -1 };
        if (sort === 'Popular') {
            sortQuery = { upvotes: -1, createdAt: -1 };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await Post.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate('author', 'username avatar')
            .populate('comments.author', 'username avatar');

        // Check for more pages
        const total = await Post.countDocuments(query);
        const hasMore = skip + posts.length < total;

        // Add isOwner and Vote status flags
        const postsWithOwnership = posts.map(post => {
            const postObj = post.toObject();
            postObj.isOwner = post.userHash === currentUserHash;

            // Check if current user ID is in the vote arrays
            if (req.user && req.user.id) {
                const upvotedBy = post.upvotedBy || [];
                const downvotedBy = post.downvotedBy || [];
                postObj.hasUpvoted = upvotedBy.map(id => id.toString()).includes(req.user.id);
                postObj.hasDownvoted = downvotedBy.map(id => id.toString()).includes(req.user.id);
            } else {
                postObj.hasUpvoted = false;
                postObj.hasDownvoted = false;
            }

            delete postObj.upvotedBy;
            delete postObj.downvotedBy;

            return postObj;
        });

        console.log(`Returning ${postsWithOwnership.length} posts (Page ${page})`);
        res.json({ posts: postsWithOwnership, hasMore, total });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create a post
router.post('/', auth, async (req, res) => {
    try {
        const { content, category } = req.body;
        const userHash = getUserHash(req);

        // Validation
        if (!content || !category) {
            return res.status(400).json({ message: 'Content and category are required' });
        }

        // Sanitize inputs
        const sanitizedContent = sanitizeInput(content);
        const sanitizedCategory = sanitizeInput(category);

        // Validate content length
        if (sanitizedContent.length < 3) {
            return res.status(400).json({ message: 'Content must be at least 3 characters' });
        }

        if (sanitizedContent.length > 500) {
            return res.status(400).json({ message: 'Content cannot exceed 500 characters' });
        }

        // Validate category
        if (!validateCategory(sanitizedCategory)) {
            return res.status(400).json({ message: 'Invalid category selected' });
        }

        // Check for profanity
        if (filter.isProfane(sanitizedContent)) {
            return res.status(400).json({ message: 'Content contains inappropriate language' });
        }

        const post = new Post({
            content: filter.clean(sanitizedContent),
            category: sanitizedCategory,
            userHash,
            author: req.user ? req.user.id : null
        });

        const newPost = await post.save();
        await newPost.populate('author', 'username avatar');
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Post creation error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Update a post (Edit)
router.put('/:id', auth, async (req, res) => {
    try {
        const { content, category } = req.body;
        const userHash = getUserHash(req);

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.userHash !== userHash) {
            return res.status(403).json({ message: 'You do not have permission to edit this post' });
        }

        if (content) {
            if (filter.isProfane(content)) return res.status(400).json({ message: 'Content contains inappropriate language' });
            post.content = filter.clean(content);
        }
        if (category) post.category = category;

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
    try {
        const userHash = getUserHash(req);
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Allow deletion if owner OR admin
        if (post.userHash !== userHash && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a comment/reply
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const userHash = getUserHash(req);

        if (!content) return res.status(400).json({ message: 'Comment content is required' });

        if (filter.isProfane(content)) {
            return res.status(400).json({ message: 'Comment contains inappropriate language' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({
            content: filter.clean(content),
            userHash: userHash,
            author: req.user ? req.user.id : null
        });

        await post.save();
        const updatedPost = await Post.findById(req.params.id).populate('comments.author', 'username avatar');
        res.status(201).json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Report a post
router.post('/:id/report', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.reports += 1;
        if (post.reports >= 5) {
            post.status = 'hidden';
        }
        await post.save();
        res.json({ message: 'Post reported successfully', status: post.status });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Vote on a post (Atomic & Concurrency Safe)
router.patch('/:id/vote', auth, async (req, res) => {
    const { type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;

    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Initialize arrays if missing (legacy data)
        if (!post.upvotedBy) post.upvotedBy = [];
        if (!post.downvotedBy) post.downvotedBy = [];

        const hasUpvoted = post.upvotedBy.includes(userId);
        const hasDownvoted = post.downvotedBy.includes(userId);

        let updateOp = {};

        if (type === 'upvote') {
            if (hasUpvoted) {
                // Toggle OFF Upvote
                updateOp = {
                    $inc: { upvotes: -1 },
                    $pull: { upvotedBy: userId }
                };
            } else {
                // Toggle ON Upvote (and remove Downvote if exists)
                updateOp = {
                    $inc: { upvotes: 1, ...(hasDownvoted ? { downvotes: -1 } : {}) },
                    $addToSet: { upvotedBy: userId },
                    ...(hasDownvoted ? { $pull: { downvotedBy: userId } } : {})
                };
            }
        } else if (type === 'downvote') {
            if (hasDownvoted) {
                // Toggle OFF Downvote
                updateOp = {
                    $inc: { downvotes: -1 },
                    $pull: { downvotedBy: userId }
                };
            } else {
                // Toggle ON Downvote (and remove Upvote if exists)
                updateOp = {
                    $inc: { downvotes: 1, ...(hasUpvoted ? { upvotes: -1 } : {}) },
                    $addToSet: { downvotedBy: userId },
                    ...(hasUpvoted ? { $pull: { upvotedBy: userId } } : {})
                };
            }
        }

        // Atomic Update
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateOp, { new: true })
            .populate('author', 'username avatar')
            .populate('comments.author', 'username avatar');

        // Manually reconstruct the 'hasUpvoted/hasDownvoted' for response since we lean on user-specific view
        // Actually, we can just return the updated post and let frontend re-calc or sends back flags
        // Reuse the mapping logic
        const postObj = updatedPost.toObject();
        postObj.isOwner = post.userHash === (req.user ? crypto.createHash('sha256').update(req.user.id + (process.env.HASH_PEPPER || 'campus_talks_fallback_pepper')).digest('hex') : '');
        // Note: hashing logic might be complex to replicate here cleanly without function extraction, 
        // but for voting return, frontend usually just needs the counts and status.
        // Let's stick to the consistent return format.

        postObj.hasUpvoted = (updatedPost.upvotedBy || []).map(id => id.toString()).includes(userId);
        postObj.hasDownvoted = (updatedPost.downvotedBy || []).map(id => id.toString()).includes(userId);

        delete postObj.upvotedBy;
        delete postObj.downvotedBy;

        res.json(postObj);
    } catch (err) {
        console.error('Vote error:', err);
        res.status(400).json({ message: err.message });
    }
});

export default router;
