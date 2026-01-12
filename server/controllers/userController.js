import * as service from '../services/userService.js';

import ClientError from '../errors/clientError.js';


export const searchUsers = async (request, response, next) => {

    console.log(request.query);
    return response.sendStatus(501);

    // try {
    //     const users = await service.searchUsers(request.query);
    //     response.json({ users });

    // } catch (err) {
    //     if (err instanceof ClientError) {
    //         response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });
    
    //     } else {
    //         next(err);
    //     }
    // }
}


export const getUser = async (request, response, next) => {
    try {
        const user = await service.getUser(request.params.userId);
        response.json({ user });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const getAccountData = async (request, response, next) => {
    try {
        const user = await service.getAccountData(request.user._id);
        response.json({ user });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const createUser = async (request, response, next) => {
    try {
        const result = await service.createUser(request.body);

        const { _id, firstName, lastName } = result;
        response.status(201).json({ createdUser: { _id, firstName, lastName }});

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const authenticateUser = async (request, response, next) => {
    try {
        const token = await service.authenticateUser(request.body.email, request.body.password);
        response.json({ token });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const updateUser = async (request, response, next) => {
    try {
        await service.updateUser(request.user._id, request.body);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const deleteUser = async (request, response, next) => {    
    try {
        await service.deleteUser(request.user._id);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const updateOnline = async (request, response, next) => {
    try {
        await service.updateOnline(request.user._id);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const addFriend = async (request, response, next) => {
    try {
        await service.addFriend(request.user._id, request.params.userId);
        response.sendStatus(201);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const acceptFriend = async (request, response, next) => {
    try {
        await service.acceptFriend(request.user._id, request.params.userId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const removeFriend = async (request, response, next) => {
    try {
        await service.removeFriend(request.user._id, request.params.userId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}
