import * as service from '../services/userService.js';

import {
    NotFoundError,
    IncorrectPasswordError,
    AlreadyExistsError
} from '../errors/userErrors.js';


export const searchUsers = async (request, response) => {
    try {
        const result = await service.searchUsers(request.query);
        response.json({ result });

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: "Unknown internal error occured" });
    }
}


export const getUser = async (request, response) => {
    try {
        const user = await service.getUser(request.params.id);
        response.json({ user });

    } catch (err) {
        const { message } = err;

        if (err instanceof NotFoundError) {
            response.status(404);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}


export const createUser = async (request, response) => {
    try {
        const result = await service.createUser(request.body);

        const { _id, firstName, lastName } = result;
        response.status(201).json({ _id, firstName, lastName });

    } catch (err) {
        const { message } = err;

        if (err instanceof AlreadyExistsError) {
            response.status(400);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}


export const authenticateUser = async (request, response) => {
    const { email, password } = request.body;

    try {
        const token = await service.authenticateUser(email, password);
        response.json({ token });

    } catch (err) {
        const { message } = err;

        if (err instanceof NotFoundError) {
            response.status(404);

        } else if (err instanceof IncorrectPasswordError) {
            response.status(401);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}


export const updateUser = async (request, response) => {
    try {
        await service.updateUser(request.user._id, request.body);
        response.sendStatus(200);

    } catch (err) {
        const { message } = err;

        if (err instanceof AlreadyExistsError || err instanceof IncorrectPasswordError) {
            response.status(400);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}


export const deleteUser = async (request, response) => {    
    try {
        await service.deleteUser(request.user._id);
        response.sendStatus(200);

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: "Unknown internal error occured" });
    }
}


export const updateOnline = async (request, response) => {
    try {
        await service.updateOnline(request.user._id);
        response.sendStatus(200);

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: "Unknown internal error occured" });
    }
}


export const addFriend = async (request, response) => {
    try {
        await service.addFriend(request.user._id, request.params.id);
        response.sendStatus(201);

    } catch (err) {
        const { message } = err;

        if (err instanceof NotFoundError) {
            response.status(404);

        } else if (err instanceof AlreadyExistsError) {
            response.status(400);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" })
        }

        response.json({ message });
    }
}


export const acceptFriend = async (request, response) => {
    try {
        await service.acceptFriend(request.user._id, request.params.id);
        response.sendStatus(200);

    } catch (err) {
        const { message } = err;

        if (err instanceof NotFoundError) {
            response.status(404);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}


export const removeFriend = async (request, response) => {
    try {
        await service.removeFriend(request.user._id, request.params.id);
        response.sendStatus(200);

    } catch (err) {
        const { message } = err;

        if (err instanceof NotFoundError) {
            response.status(404);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}
