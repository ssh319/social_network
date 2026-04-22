import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

import corsConfig from './config/cors.js';

import authenticate from './middleware/authenticate.js';

import userRouter from './routes/userRouter.js';
import postRouter from './routes/postRouter.js';
import chatRouter from './routes/chatRouter.js';
import imageRouter from './routes/imageRouter.js';

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(cors(corsConfig));
}

app.use(bodyParser.json());

app.use((error, _, response, next) => {
    if (error instanceof SyntaxError) {
        response.status(400).json({ errors: { globalError: "Malformed JSON syntax" }});

    } else {
        next();
    }
});

app.use("/api/users", userRouter);
app.use("/api/posts", authenticate, postRouter);
app.use("/api/chats", authenticate, chatRouter);
app.use("/api/images", authenticate, imageRouter);

app.use('/uploads', express.static(path.join(path.resolve(), '/uploads')));

app.use((error, _, response, next) => {
    if (!error) {
        next();

    } else {
        // logger.log(error);
        console.error(error);
        response.status(500).json({ errors: { globalError: "Unknown internal error occured" }});
    }
});


if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();

    app.use(express.static(path.join(__dirname, "client", "build")));

    app.get("*", (_, response) => {
        response.sendFile(path.join(__dirname, "client", "build", "index.html"));
    });
}


export default app;
