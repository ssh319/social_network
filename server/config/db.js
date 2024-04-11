import mongoose from 'mongoose';


const connectToDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI;
    
    try {
        await mongoose.connect(mongoUri);
    }
    
    catch (err) {
        console.error("MongoDB connection failed:\n", err);
        process.exit(1);
    }
}


export default connectToDatabase;
