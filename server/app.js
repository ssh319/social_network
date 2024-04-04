// logging? (or server.js?)

import express from 'express';
import bodyParser from 'body-parser';

import corsConfig from './config/cors.js';

// import authenticateUser from './middleware/authenticateUser.js';

import userRouter from './routes/userRouter.js';
// import postRouter from './routes/postRouter.js';
// import chatRouter from './routes/chatRouter.js';
// import imageRouter from './routes/imageRouter.js';


const app = express();

// throws SyntaxError's
app.use(bodyParser.json());
app.use(corsConfig);

app.use("/users", userRouter);
// app.use("/posts", authenticateUser, postRouter);
// app.use("/chats", authenticateUser, chatRouter);
// app.use("/images", authenticateUser, imageRouter);


export default app;
