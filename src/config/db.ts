import mongoose from "mongoose";

mongoose.set('strictQuery', true);

const connectDB = async (): Promise<void> => {
    if (!process.env.MONGO_URI) {
        throw new Error('Please provide a MongoDB URI in the environment variables');
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI!);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
    } catch (error: Error | unknown ) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`MongoDB connection error: ${errorMsg}`);
        process.exit(1);
    }
}

export default connectDB;