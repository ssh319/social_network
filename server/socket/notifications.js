import { getIO } from "./index.js";


export const emitNotification = (receiverId, notification) => {
    const io = getIO();
    io.to(receiverId.toHexString()).emit('notification', notification);
}
