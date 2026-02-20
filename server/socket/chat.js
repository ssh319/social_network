import { getIO } from './index.js';


export const emitMessage = (receiverId, message) => {
    const io = getIO();
    io.to(receiverId.toHexString()).emit('newMessage', message);
}
