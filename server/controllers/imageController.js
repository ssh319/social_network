import * as service from '../services/imageService.js';

import ClientError from '../errors/clientError.js';


export const getImage = async (request, response) => {
    try {
        const image = await service.getImage(request.params.imageId);
        response.json({ image });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const uploadImage = async (request, response) => {
    try {
        await service.uploadImage(request.user._id, request.body);
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


export const deleteImage = async (request, response) => {
    try {
        await service.deleteImage(request.params.imageId);
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


// likes logic will use addToSet(), and ignore req if there is already like or there was no like for removal
// so 404 is only if the image wasn't found
export const likeImage = async (request, response) => {
    try {
        await service.likeImage(request.user._id, request.params.imageId);
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


export const unlikeImage = async (request, response) => {
    try {
        await service.unlikeImage(request.user._id, request.params.imageId);
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
