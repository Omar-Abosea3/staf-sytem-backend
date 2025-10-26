import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string || "mongodb://127.0.0.1:27017/staf-system");
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection error:', error);
    }
};

export default connectDB;