import mongoose from 'mongoose';


export const connectDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI;

    await mongoose.connect(mongoUri, { family: 4 });
}


export const disconnectDatabase = async () => {
    await mongoose.connection.close();
}
