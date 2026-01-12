import express from 'express';
import bodyParser from 'body-parser';

import corsConfig from './config/cors.js';

import authenticate from './middleware/authenticate.js';

import userRouter from './routes/userRouter.js';
import postRouter from './routes/postRouter.js';
import chatRouter from './routes/chatRouter.js';
import imageRouter from './routes/imageRouter.js';


const app = express();

// CORS conf. to server.js
app.use(corsConfig);

app.use(bodyParser.json());

app.use((error, _, response, next) => {
    if (error instanceof SyntaxError) {
        response.status(400).json({ errors: { globalError: "Malformed JSON syntax" }});

    } else {
        next();
    }
});

// api access?

app.use("/users", userRouter);
app.use("/posts", authenticate, postRouter);
app.use("/chats", authenticate, chatRouter);
app.use("/images", authenticate, imageRouter);

app.use((error, _, response, next) => {
    if (!error) {
        next();

    } else {
        // logger.log(error);
        console.error(error);
        response.status(500).json({ errors: { globalError: "Unknown internal error occured" }});
    }
});


export default app;
