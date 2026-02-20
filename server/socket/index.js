import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import corsConfig from '../config/cors.js';


let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: corsConfig
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error("Unauthorized"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            socket.userId = decoded._id;

            next();

        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });

    io.on('connection', socket => {
        socket.join(socket.userId);

        socket.on('disconnect', () => {});
    });

    return io;
}


export const getIO = () => {
    if (!io) throw new Error("No socket initialized");
    return io;
}
