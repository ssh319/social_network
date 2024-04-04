import mongoose from 'mongoose';


// PATCH for every message? (upd: or POST because pushing to 'messages' array?)
// or separate Message model with chatId? (-perfomance) (ability to forward, edit, delete msg? (internal _id in msg object?))
const chatSchema = new mongoose.Schema({
    primaryUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    secondaryUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Messages ObjectId array in separate model case
    // upd: messages pop() ability for rendering dialogue, showing chat's last msg if nested objects' array
    // upd: mongoose automatically creates _id
    messages: [{
        // _id?
        timestamp: { type: Date, default: Date.now },
        text: { type: String, required: true },
        isRead: { type: Boolean, default: false }
    }]
});

const Chat = mongoose.model('Chat', chatSchema);


export default Chat;
