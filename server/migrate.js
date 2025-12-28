import mongoose from 'mongoose';
import User from './models/User.js';
import Post from './models/Post.js';
import crypto from 'crypto';
import 'dotenv/config';

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Migration engaged: Linking ghosts and normalizing data...');

        // 1. Normalize Categories (Ensure they match the IDs exactly)
        const posts = await Post.find({});
        for (const post of posts) {
            // Capitalize first letter, lowercase rest to match seeded IDs
            const normalizedCat = post.category.charAt(0).toUpperCase() + post.category.slice(1).toLowerCase();
            if (post.category !== normalizedCat) {
                post.category = normalizedCat;
                await post.save();
            }
        }

        // 2. Link Owners
        const users = await User.find({});
        let updatedCount = 0;
        // ... rest remains same

        for (const user of users) {
            // Reconstruct the hash used in auth.js middleware
            const userHandleHash = crypto.createHash('sha256').update(user._id.toString()).digest('hex');

            // Find all posts by this hash that don't have an author field yet
            const result = await Post.updateMany(
                { userHash: userHandleHash, author: { $exists: false } },
                { $set: { author: user._id } }
            );

            // Also update comments
            const postsWithComments = await Post.find({ 'comments.userHash': userHandleHash });
            for (const post of postsWithComments) {
                let changed = false;
                post.comments.forEach(comment => {
                    if (comment.userHash === userHandleHash && !comment.author) {
                        comment.author = user._id;
                        changed = true;
                    }
                });
                if (changed) {
                    await post.save();
                    updatedCount++;
                }
            }

            if (result.modifiedCount > 0) {
                console.log(`Linked ${result.modifiedCount} whispers to @${user.username}`);
                updatedCount += result.modifiedCount;
            }
        }

        console.log(`Success: ${updatedCount} legacy entries synchronized.`);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        mongoose.connection.close();
    }
};

migrate();
