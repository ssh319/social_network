import mongoose from 'mongoose';


const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },

    text: { type: String, required: true },
    
    // uploadImage calls from frontend before createPost call
    // => created post's 'images' will have created ObjectIds
    images: { type: [mongoose.Schema.Types.ObjectId], ref: 'Image' },

    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' },
    
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' }
    }]
});

const Post = mongoose.model('Post', postSchema);


export default Post;
