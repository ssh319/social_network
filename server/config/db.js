import mongoose from 'mongoose';


const connectToDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI;

    await mongoose.connect(mongoUri);
}


export default connectToDatabase;
