import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    country: { type: String, default: null },
    city: { type: String, default: null },
    birthDate: { type: Date, default: null },
    aboutMe: { type: String, default: null },
    
    publicStatus: { type: String, default: null },

    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },

    friends: [{
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['friend', 'sent', 'received'], required: true }
    }],

    posts: { type: [mongoose.Schema.Types.ObjectId], ref: 'Post' },

    chats: { type: [mongoose.Schema.Types.ObjectId], ref: 'Chat' },

    images: { type: [mongoose.Schema.Types.ObjectId], ref: 'Image' },
    profilePicture: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', default: null },
});

const User = mongoose.model('User', userSchema);


export default User;
