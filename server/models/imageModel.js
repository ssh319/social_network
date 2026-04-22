import mongoose from 'mongoose';


const imageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    
    // unique name generation
    path: { type: String, required: true },
    mimeType: { type: String, enum: ['image/png', 'image/jpeg'], required: true },

    size: { type: Number, required: true },
    
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' }
});

const Image = mongoose.model('Image', imageSchema);


export default Image;
