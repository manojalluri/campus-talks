import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Config from './models/Config.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const config = await Config.findOne({ key: 'admin_password' });
        if (config) {
            console.log('Value in DB:', config.value);
            console.log('Is it hashed?', config.value.startsWith('$2'));
        } else {
            console.log('No password in DB, using ENV');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
