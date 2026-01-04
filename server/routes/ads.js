import express from 'express';
import Ad from '../models/Ad.js';

const router = express.Router();

// Get active ads (public route)
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        const now = new Date();

        const query = {
            isActive: true,
            $or: [
                { startDate: { $exists: false } },
                { startDate: { $lte: now } }
            ],
            $and: [
                {
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: { $gte: now } }
                    ]
                }
            ]
        };

        if (type) {
            query.type = type;
        }

        const ads = await Ad.find(query).select('-impressions -clicks').sort({ createdAt: -1 });
        res.json(ads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Record impression
router.post('/:id/impression', async (req, res) => {
    try {
        await Ad.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Record click
router.post('/:id/click', async (req, res) => {
    try {
        await Ad.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
