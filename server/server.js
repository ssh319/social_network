import dotenv from 'dotenv';
import mongoose from 'mongoose';
// import https from 'https';
// import fs from 'fs';

import app from './app.js';
import connectToDatabase from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '127.0.0.1';

// const key = fs.readFileSync('./ssl/cert.key');
// const cert = fs.readFileSync('./ssl/cert.crt');
// const httpsServer = https.createServer({ key, cert }, app);
// httpsServer.listen(PORT, HOST, () => {});


(async () => {
    try {
        await connectToDatabase();
        
        app.listen(PORT, HOST, () => {
            console.log(`Listening on ${HOST}:${PORT}`);
        });

    } catch (err) {
        console.error("Express application start failed:\n", err);
        process.exit(1);
    }
})();


process.on("SIGINT", async () => {

    console.log("\nInterrupt signal received..");

    await mongoose.connection.close();
    console.log("MongoDB connection has been closed.");
    process.exit(0);
});
