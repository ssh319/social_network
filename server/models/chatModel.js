import mongoose from 'mongoose';


const chatSchema = new mongoose.Schema({
    // users array for saved (len=1), private (len=2) messages & group chats (len<=200?)
    primaryUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    secondaryUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    messages: [{
        // _id (automatically)
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        text: { type: String, required: true },
        isRead: { type: Boolean, default: false }
    }]
});

const Chat = mongoose.model('Chat', chatSchema);


export default Chat;
