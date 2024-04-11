import mongoose from 'mongoose';


const chatSchema = new mongoose.Schema({
    primaryUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    secondaryUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    messages: [{
        // _id (automatically)
        timestamp: { type: Date, default: Date.now },
        text: { type: String, required: true },
        isRead: { type: Boolean, default: false }
    }]
});

const Chat = mongoose.model('Chat', chatSchema);


export default Chat;
