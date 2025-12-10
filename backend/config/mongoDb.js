// backend/config/mongoDb.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB (Feedback System)');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
    }
};

export default connectMongoDB;