import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
import fs from 'fs';

import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { initSocket } from './socket/index.js';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '127.0.0.1';


let server;

if (process.env.NODE_ENV === 'development') {
    server = http.createServer(app);
    
} else if (process.env.NODE_ENV === 'production') {
    const key = fs.readFileSync('./ssl/cert.key');
    const cert = fs.readFileSync('./ssl/cert.crt');
    
    server = https.createServer({ key, cert }, app);
}

let io;

(async () => {
    try {
        await connectDatabase();

        io = initSocket(server);
        
        server.listen(PORT, HOST, () => {
            console.log(`Listening on ${HOST}:${PORT}`);
        });

    } catch (err) {
        console.error("Express application start failed:\n", err);
        process.exit(1);
    }
})();


process.on("SIGINT", async () => {

    console.log("\nInterrupt signal received..");

    for (const socket of io.sockets.sockets.values()) {
        socket.disconnect(true);
    }

    await new Promise(resolve => io.close(resolve));
    console.log("IO socket closed.");

    await new Promise(resolve => server.close(resolve));
    console.log("HTTP server closed.");

    await disconnectDatabase();
    console.log("MongoDB connection closed.");

    process.exit(0);
});
