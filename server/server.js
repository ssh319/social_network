import dotenv from 'dotenv';
import http from 'http';
// import https from 'https';
// import fs from 'fs';

import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { initSocket } from './socket/index.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '127.0.0.1';

// const key = fs.readFileSync('./ssl/cert.key');
// const cert = fs.readFileSync('./ssl/cert.crt');
// const httpsServer = https.createServer({ key, cert }, app);
// httpsServer.listen(PORT, HOST, () => {});

const server = http.createServer(app);
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

    // not printing server and io closure if client is connected
    server.close(() => {
        console.log("HTTP server closed.");
    })

    io.close(() => {
        console.log("IO socket closed.");
    })

    await disconnectDatabase();
    console.log("MongoDB connection closed.");

    process.exit(0);
});
