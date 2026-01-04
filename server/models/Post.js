import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userHash: { type: String }, // Optional for guest comments or legacy
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true
  },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reports: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active'
  },
  comments: [commentSchema],
  userHash: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Critical Indexes for Scale
postSchema.index({ status: 1, createdAt: -1 }); // Default feed
postSchema.index({ category: 1, status: 1, createdAt: -1 }); // Category feed
postSchema.index({ status: 1, upvotes: -1 }); // Popular feed
postSchema.index({ status: 1, reports: -1 }); // Admin report queue

const Post = mongoose.model('Post', postSchema);
export default Post;
