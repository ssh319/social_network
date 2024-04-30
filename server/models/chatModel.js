import mongoose from 'mongoose';


const chatSchema = new mongoose.Schema({
    // 'users' array for: saved messages (len=1), private messages (len=2), group chats (len<=100)
    primaryUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    secondaryUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    messages: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        text: { type: String, required: true },
        isRead: { type: Boolean, default: false }
    }]
});

const Chat = mongoose.model('Chat', chatSchema);


export default Chat;
