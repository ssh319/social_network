import { Types } from 'mongoose';

import { getIO } from './index.js';


export const emitMessage = (receiverId, message) => {
    const io = getIO();
    io.to(receiverId instanceof Types.ObjectId ? receiverId.toHexString() : receiverId).emit('newMessage', message);
}
