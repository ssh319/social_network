import mongoose from 'mongoose';


const imageSchema = new mongoose.Schema({
    // => user (populate with firstName, lastName)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },

    path: { type: String, required: true },
    contentType: { type: String, enum: ['image/png', 'image/jpeg'], required: true }, // image/pjpeg? (MIME)
    filename: { type: String, required: true }, // src filename

    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' }
});

const Image = mongoose.model('Image', imageSchema);


export default Image;
