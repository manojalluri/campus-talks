import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['popup', 'banner', 'sponsor'],
        required: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    linkUrl: { type: String, trim: true },
    buttonText: { type: String, default: 'Learn More', trim: true },

    // Display settings
    isActive: { type: Boolean, default: true },
    position: {
        type: String,
        enum: ['top', 'middle', 'bottom', 'sidebar', 'feed'],
        default: 'feed'
    },

    // For popups - display frequency
    displayFrequency: {
        type: String,
        enum: ['once', 'session', 'always'],
        default: 'session'
    },

    // Scheduling
    startDate: { type: Date },
    endDate: { type: Date },

    // Analytics
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

adSchema.index({ type: 1, isActive: 1 });
adSchema.index({ startDate: 1, endDate: 1 });

const Ad = mongoose.model('Ad', adSchema);
export default Ad;
