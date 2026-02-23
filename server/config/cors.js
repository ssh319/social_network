import dotenv from 'dotenv';

dotenv.config();


const corsConfig = {
    // ...
    // origin: "http://localhost:3000",
    origin: 'http://192.168.1.10:3000',
    credentials: true
}


export default corsConfig;
