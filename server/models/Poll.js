import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
});

const pollSchema = new mongoose.Schema({
    question: { type: String, required: true, trim: true },
    options: [pollOptionSchema],
    expiresAt: { type: Date, required: true },
    userHash: { type: String, required: true },
    voters: [String], // Array of userHashes who voted
    createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', pollSchema);
export default Poll;
