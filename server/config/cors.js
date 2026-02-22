// import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


const corsConfig = {
    // ...
    // origin: "http://localhost:3000",
    credentials: true,
    origin: `http://${process.env.HOST}:3000`
}


export default corsConfig;
