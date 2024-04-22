import * as service from '../services/userService.js';

import ClientError from '../errors/clientError.js';


// next(err) if not ClientError? (err handler to respond with 500 and write to logs)
export const searchUsers = async (request, response) => {
    response.sendStatus(501);
    // try {
    //     const result = await service.searchUsers(request.query);
    //     response.json({ result });

    // } catch (err) {
    //     if (err instanceof ClientError) {
    //         response.status(err.statusCode).json({ message: err.message });
    
    //     } else {
    //         console.error(err);
    //         response.status(500).json({ message: "Unknown internal error occured" });
    //     }
    // }
}


export const getUser = async (request, response) => {
    try {
        const user = await service.getUser(request.params.userId);
        response.json({ user });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const createUser = async (request, response) => {
    try {
        const result = await service.createUser(request.body);

        const { _id, firstName, lastName } = result;
        response.status(201).json({ _id, firstName, lastName });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const authenticateUser = async (request, response) => {
    try {
        const token = await service.authenticateUser(request.body.email, request.body.password);
        response.json({ token });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const updateUser = async (request, response) => {
    try {
        await service.updateUser(request.user._id, request.body);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const deleteUser = async (request, response) => {    
    try {
        await service.deleteUser(request.user._id);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const updateOnline = async (request, response) => {
    try {
        await service.updateOnline(request.user._id);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const addFriend = async (request, response) => {
    try {
        await service.addFriend(request.user._id, request.params.userId);
        response.sendStatus(201);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const acceptFriend = async (request, response) => {
    try {
        await service.acceptFriend(request.user._id, request.params.userId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const removeFriend = async (request, response) => {
    try {
        await service.removeFriend(request.user._id, request.params.userId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}
