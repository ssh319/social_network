import mongoose from 'mongoose';


const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    
    images: { type: [mongoose.Schema.Types.ObjectId], ref: 'Image' },

    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' },
    
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' }
    }]
});

const Post = mongoose.model('Post', postSchema);


export default Post;
