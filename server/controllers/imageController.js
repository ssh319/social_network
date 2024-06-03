import * as service from '../services/imageService.js';

import ClientError from '../errors/clientError.js';


export const getImage = async (request, response, next) => {
    try {
        const image = await service.getImage(request.params.imageId);
        response.json({ image });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const uploadImage = async (request, response, next) => {
    try {
        await service.uploadImage(request.user._id, request.body);
        response.sendStatus(201);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const deleteImage = async (request, response, next) => {
    try {
        await service.deleteImage(request.params.imageId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const likeImage = async (request, response, next) => {
    try {
        await service.likeImage(request.user._id, request.params.imageId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const unlikeImage = async (request, response, next) => {
    try {
        await service.unlikeImage(request.user._id, request.params.imageId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}
