// logging? (or server.js?)

import express from 'express';
import bodyParser from 'body-parser';

import corsConfig from './config/cors.js';

// import authenticate from './middleware/authenticate.js';

import userRouter from './routes/userRouter.js';
// import postRouter from './routes/postRouter.js';
// import chatRouter from './routes/chatRouter.js';
// import imageRouter from './routes/imageRouter.js';


const app = express();

// throws SyntaxError's
app.use(bodyParser.json());
app.use(corsConfig);

// '/api/v1'
// 404 route

app.use("/users", userRouter);
// app.use("/posts", authenticate, postRouter);
// app.use("/chats", authenticate, chatRouter);
// app.use("/images", authenticate, imageRouter);


export default app;
