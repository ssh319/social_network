import mongoose from 'mongoose';


const imageSchema = new mongoose.Schema({
    // imageValidators.js middleware full validation
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },

    path: { type: String, required: true },
    contentType: { type: String, required: true }, // image/png | image/jpeg | ... (MIME type)
    filename: { type: String, required: true }, // src filename

    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }
});

const Image = mongoose.model('Image', imageSchema);


export default Image;
