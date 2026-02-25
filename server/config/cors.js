import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const corsConfig = {
    origin: `http://${process.env.HOST}:3000`,
    credentials: true
}


export default corsConfig;
