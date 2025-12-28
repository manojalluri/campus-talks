import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';

dotenv.config();

async function checkPosts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const posts = await Post.find({});
        console.log(`Total posts found: ${posts.length}`);
        posts.forEach(p => {
            console.log(`- ID: ${p._id}, Status: ${p.status}, Category: ${p.category}, UserHash: ${p.userHash.substring(0, 8)}...`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPosts();
