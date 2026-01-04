import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ad from './models/Ad.js';

dotenv.config();

async function clean() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await Ad.deleteMany({});
        console.log(`Deleted ${result.deletedCount} ads.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

clean();
