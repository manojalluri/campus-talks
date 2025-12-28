import mongoose from 'mongoose';
import Post from './models/Post.js';
import Category from './models/Category.js';
import 'dotenv/config';

const categoriesData = [
    { id: 'Movies', label: 'Movies', icon: '📽️', order: 1 },
    { id: 'Rant', label: 'Rant', icon: '😤', order: 2 },
    { id: 'Confession', label: 'Confession', icon: '🤫', order: 3 },
    { id: 'Meme', label: 'Meme', icon: '😂', order: 4 },
    { id: 'Academic', label: 'Academic', icon: '📚', order: 5 },
    { id: 'Appreciation', label: 'Appreciation', icon: '❤️', order: 6 },
    { id: 'Advice', label: 'Advice', icon: '💡', order: 7 },
];

const postData = [
    { content: "Anyone excited for the new Dune movie? The visuals look insane. 🍿", category: "Movies", upvotes: 24, userHash: "seed_1", status: "active" },
    { content: "Can we talk about how the library AC is basically Antarctica right now? 🥶 I'm wearing a hoodie and still shivering.", category: "Rant", upvotes: 56, userHash: "seed_2", status: "active" },
    { content: "I actually think the cafeteria's Monday mystery meat is... kind of good? Don't exile me. 🤐", category: "Confession", upvotes: 12, userHash: "seed_3", status: "active" },
    { content: "Shoutout to the person who found my AirPods in the student lounge and handed them to security. There are still good people! ❤️", category: "Appreciation", upvotes: 142, userHash: "seed_4", status: "active" },
    { content: "The midterm for Chem 101 was a war zone. Who else failed? 📚💀", category: "Academic", upvotes: 89, userHash: "seed_5", status: "active" },
    { content: "Me trying to explain to my parents why I need more 'research' money (it's for the new Spider-Man game). 😂🎮", category: "Meme", upvotes: 210, userHash: "seed_6", status: "active" },
    { content: "Pro tip for freshmen: The coffee at the sub-basement cafe is 2x stronger and 1/2 the price of the main hall. 💡☕", category: "Advice", upvotes: 95, userHash: "seed_7", status: "active" },
    { content: "Does anyone want to start a weekly movie night in the dorm common room? Thinking old horror movies. 📽️👻", category: "Movies", upvotes: 34, userHash: "seed_8", status: "active" },
    { content: "Parking on campus is a hunger games simulator. Why are we paying so much for no spots? 😤🚗", category: "Rant", upvotes: 120, userHash: "seed_9", status: "active" },
    { content: "I've been using a fake name at the campus gym for 3 months and now it's too late to correct them. 🤫🏋️", category: "Confession", upvotes: 45, userHash: "seed_10", status: "active" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Clear and Re-seed Categories
        await Category.deleteMany({});
        await Category.insertMany(categoriesData);
        console.log("Categories seeded successfully!");

        // Clear and Re-seed Posts
        await Post.deleteMany({});
        await Post.insertMany(postData);
        console.log("Whispers (Raw Data) seeded successfully!");

    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
