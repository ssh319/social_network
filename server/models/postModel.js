import mongoose from 'mongoose';


const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },

    text: { type: String, required: true },
    
    images: { type: [mongoose.Schema.Types.ObjectId], ref: 'Image' },

    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' },
    
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' }
    }]
});

const Post = mongoose.model('Post', postSchema);


export default Post;
