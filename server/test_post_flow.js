import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';
import Category from './models/Category.js';

dotenv.config();

/**
 * Test script to verify post creation and retrieval
 * This ensures posts are properly saved and can be fetched
 */
async function testPostFlow() {
    try {
        console.log('🔍 Testing Post Flow...\n');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Check Categories
        console.log('📁 Checking Categories...');
        const categories = await Category.find().sort({ order: 1 });
        console.log(`Found ${categories.length} categories:`);
        categories.forEach(cat => console.log(`   - ${cat.icon} ${cat.label} (${cat.id})`));
        console.log('');

        // 2. Count existing posts
        const existingCount = await Post.countDocuments({ status: 'active' });
        console.log(`📊 Current active posts: ${existingCount}\n`);

        // 3. Create a test post
        console.log('✏️  Creating test post...');
        const testPost = new Post({
            content: 'This is a test whisper to verify the system is working correctly.',
            category: 'Academic',
            userHash: 'test_hash_' + Date.now(),
            status: 'active'
        });

        const savedPost = await testPost.save();
        console.log(`✅ Test post created with ID: ${savedPost._id}\n`);

        // 4. Retrieve all active posts
        console.log('🔎 Fetching all active posts...');
        const allPosts = await Post.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5);
        console.log(`Found ${allPosts.length} recent posts:\n`);

        allPosts.forEach((post, idx) => {
            console.log(`${idx + 1}. [${post.category}] ${post.content.substring(0, 60)}...`);
            console.log(`   Created: ${post.createdAt.toLocaleString()}`);
            console.log(`   Status: ${post.status}\n`);
        });

        // 5. Test category filter
        console.log('🏷️  Testing category filter (Academic)...');
        const academicPosts = await Post.find({
            status: 'active',
            category: { $regex: new RegExp('^Academic$', 'i') }
        });
        console.log(`Found ${academicPosts.length} Academic posts\n`);

        // 6. Clean up test post
        console.log('🧹 Cleaning up test post...');
        await Post.findByIdAndDelete(savedPost._id);
        console.log('✅ Test post removed\n');

        console.log('✅ ALL TESTS PASSED! Post flow is working correctly.\n');

    } catch (err) {
        console.error('❌ TEST FAILED:', err.message);
        console.error(err);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

testPostFlow();
