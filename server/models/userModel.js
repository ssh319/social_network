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
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['friend', 'sent', 'received'] }
    }],

    posts: { type: [mongoose.Schema.Types.ObjectId], ref: 'Post', default: [] },

    images: { type: [mongoose.Schema.Types.ObjectId], ref: 'Image', default: [] },
    profilePicture: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', default: null },
});

const User = mongoose.model('User', userSchema);


export default User;
