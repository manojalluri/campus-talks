import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Config from './models/Config.js';

dotenv.config();

async function reset() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Config.deleteOne({ key: 'admin_password' });
        console.log('Admin password record DELETED from database.');
        console.log('The system will now fall back to the password in your .env file.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

reset();
