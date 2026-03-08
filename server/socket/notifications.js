import { Types } from 'mongoose';

import { getIO } from './index.js';


export const emitNotification = (receiverId, notification) => {
    const io = getIO();
    io.to(receiverId instanceof Types.ObjectId ? receiverId.toHexString() : receiverId).emit('notification', notification);
}
