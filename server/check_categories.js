import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const cats = await Category.find({});
        console.log(`Total categories found: ${cats.length}`);
        cats.forEach(c => {
            console.log(`- ID: ${c.id}, Label: ${c.label}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCategories();
