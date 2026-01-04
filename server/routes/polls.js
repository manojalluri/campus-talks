import express from 'express';
import Poll from '../models/Poll.js';
import crypto from 'crypto';
import auth from '../middleware/auth.js';

const router = express.Router();

const getUserHash = (req) => {
    let data;
    if (req.user && req.user.id) {
        data = req.user.id;
    } else {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const ua = req.headers['user-agent'] || 'unknown';
        data = ip + ua;
    }
    return crypto.createHash('sha256').update(data).digest('hex');
};

// Get all polls (with auth to check if voted)
router.get('/', auth, async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        const userHash = getUserHash(req);

        const pollsWithVoteStatus = polls.map(poll => {
            const pollObj = poll.toObject();
            pollObj.hasVoted = poll.voters.includes(userHash);
            // Hide voters list from frontend for privacy
            delete pollObj.voters;
            return pollObj;
        });

        res.json(pollsWithVoteStatus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a poll
router.post('/', auth, async (req, res) => {
    const { question, options, duration } = req.body;
    const userHash = getUserHash(req);

    if (!question || !options || options.length < 2) {
        return res.status(400).json({ message: 'Question and at least 2 options are required' });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (duration || 24));

    const poll = new Poll({
        question,
        options: options.map(opt => ({ text: opt })),
        expiresAt,
        userHash
    });

    try {
        const newPoll = await poll.save();
        res.status(201).json(newPoll);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Vote in a poll
router.post('/:id/vote', auth, async (req, res) => {
    const { optionId } = req.body;
    const userHash = getUserHash(req);

    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (new Date() > poll.expiresAt) {
            return res.status(400).json({ message: 'Poll has expired' });
        }

        if (poll.voters.includes(userHash)) {
            return res.status(400).json({ message: 'You have already voted in this poll' });
        }

        const option = poll.options.id(optionId);
        if (!option) return res.status(400).json({ message: 'Invalid option' });

        option.votes += 1;
        poll.voters.push(userHash);
        await poll.save();

        const pollObj = poll.toObject();
        pollObj.hasVoted = true;
        delete pollObj.voters;

        res.json(pollObj);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Edit a poll
router.put('/:id', auth, async (req, res) => {
    try {
        const { question, options } = req.body;
        const userHash = getUserHash(req);

        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.userHash !== userHash) {
            return res.status(403).json({ message: 'You do not have permission to edit this poll' });
        }

        if (question) poll.question = question;

        // Update options if provided (complex: map by ID or index?)
        // Simple approach: Replace options if provided, BUT this wipes votes if IDs change.
        // Better approach: Update text matches or expect IDs.
        // For this iteration, let's assume simple text update if no votes, or just allow question edit.
        // Given complexity, I will allow question edit always, and option text edit.

        if (options && Array.isArray(options)) {
            // If options have IDs, update them. If strings, difficult to map.
            // Assuming simple array of strings for now as per Create flow.
            // To preserve votes, we only update text if count matches?
            // Let's just update the question for safety in this version unless requested otherwise.
            // Actually, the user specifically asked to "edit the poll option".
            // I will try to map by index.
            options.forEach((optText, idx) => {
                if (poll.options[idx]) {
                    poll.options[idx].text = optText;
                }
            });
        }

        await poll.save();
        res.json(poll);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
