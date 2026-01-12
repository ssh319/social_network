import jwt from 'jsonwebtoken';

import User from '../models/userModel.js';


const authenticate = async (request, response, next) => {

    const authHeader = request.headers.authorization;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const { _id } = jwt.verify(authHeader.split(" ")[1], jwtSecretKey);
            
            const user = await User.findById(_id);

            if (!user) {
                return response.status(404).json({
                    errors: { globalError: "The user you're logged in as doesn't exist anymore" }
                });
            }

            request.user = { _id };

            next();

        } catch (err) {

            if (err instanceof jwt.JsonWebTokenError) {
                response.status(401).json({ errors: { globalError: "Invalid JWT token provided: " + err.message }});

            } else {
                console.error(err);
                response.status(500).json({ errors: { globalError: "Unknown internal error occured" }});
            }
        }

    } else {
        response.status(401).json({ errors: { globalError: "You need to log in first" }});
    }
}


export default authenticate;
