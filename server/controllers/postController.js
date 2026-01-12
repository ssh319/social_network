import * as service from '../services/postService.js';

import ClientError from '../errors/clientError.js';


export const getPostsFeed = async (request, response, next) => {
    try {
        const posts = await service.getPostsFeed(request.user._id);
        response.json({ posts });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const getPost = async (request, response, next) => {
    try {
        const post = await service.getPost(request.params.postId);
        response.json({ post });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const createPost = async (request, response, next) => {
    try {
        const createdPost = await service.createPost(request.user._id, request.body);
        response.status(201).json({ createdPost });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const deletePost = async (request, response, next) => {
    try {
        await service.deletePost(request.params.postId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const likePost = async (request, response, next) => {
    try {
        await service.likePost(request.user._id, request.params.postId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const unlikePost = async (request, response, next) => {
    try {
        await service.unlikePost(request.user._id, request.params.postId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const sendPostComment = async (request, response, next) => {
    try {
        await service.sendPostComment(request.user._id, request.params.postId, request.body);
        response.sendStatus(201);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const deletePostComment = async (request, response, next) => {
    try {
        await service.deletePostComment(request.params.postId, request.params.commentId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const likePostComment = async (request, response, next) => {
    try {
        await service.likePostComment(request.user._id, request.params.postId, request.params.commentId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const unlikePostComment = async (request, response, next) => {
    try {
        await service.unlikePostComment(request.user._id, request.params.postId, request.params.commentId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}
