import cors from 'cors';
// import dotenv from 'dotenv';

// dotenv.config();


const corsOptions = {
    // ...
    origin: "http://localhost:3000"
    // origin: `http://${process.env.HOST}:3000`
}


export default cors(corsOptions);
