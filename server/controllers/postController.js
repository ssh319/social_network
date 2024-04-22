import * as service from '../services/postService.js';

import ClientError from '../errors/clientError.js';


export const getPostsFeed = async (request, response) => {
    try {
        const posts = await service.getPostsFeed(request.user._id);
        response.json({ posts });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const getPost = async (request, response) => {
    try {
        const post = await service.getPost(request.params.postId);
        response.json({ post });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const createPost = async (request, response) => {
    try {
        await service.createPost(request.user._id, request.body);
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


export const deletePost = async (request, response) => {
    try {
        await service.deletePost(request.params.postId);
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


export const likePost = async (request, response) => {
    try {
        await service.likePost(request.user._id, request.params.postId);
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


export const unlikePost = async (request, response) => {
    try {
        await service.unlikePost(request.user._id, request.params.postId);
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


export const sendPostComment = async (request, response) => {
    try {
        await service.sendPostComment(request.user._id, request.params.postId, request.body);
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


export const editPostComment = async (request, response) => {
    try {
        await service.editPostComment(request.params.postId, request.params.commentId, request.body);
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


export const deletePostComment = async (request, response) => {
    try {
        await service.deletePostComment(request.params.postId, request.params.commentId);
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
