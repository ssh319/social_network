import { isValidObjectId } from 'mongoose';
import { body, checkExact, validationResult } from 'express-validator';


export const validatePostId = (request, response, next) => {
    if (!isValidObjectId(request.params.postId)) {
        return response.status(400).json({ errors: { postId: "Invalid post id provided" }});
    }

    next();
}


export const validateCommentId = (request, response, next) => {
    if (!isValidObjectId(request.params.commentId)) {
        return response.status(400).json({ errors: { commentId: "Invalid comment id provided" }});
    }

    next();
}


export const validatePost = [
    body("text")
        .isString().withMessage("Invalid data type for post text").bail()
        .notEmpty().withMessage("Post text cannot be empty")
        .isLength({ max: 3000 }).withMessage("Post comment cannot be more than 3000 characters in length"),

    // is array of ObjectId's
    body("images")
        .optional()
        .isArray().withMessage("Invalid data type for images list").bail(),

    checkExact(),

    (request, response, next) => {
        const validationErrors = validationResult(request);

        if (!validationErrors.isEmpty()) {
            return response.status(400).json({
                errors: validationErrors.errors.reduce((acc, { path, msg }) => {
                    acc[path] = msg;
                    return acc;
                }, {})
            });
        }

        next();
    }
]


export const validateComment = [
    body("text")
        .isString().withMessage("Invalid data type for post comment text").bail()
        .notEmpty().withMessage("Empty comment text provided").bail()
        .isLength({ max: 1000 }).withMessage("Post comment cannot be more than 1000 characters in length"),

    checkExact(),

    (request, response, next) => {
        const validationErrors = validationResult(request);

        if (!validationErrors.isEmpty()) {
            return response.status(400).json({
                errors: validationErrors.errors.reduce((acc, { path, msg }) => {
                    acc[path] = msg;
                    return acc;
                }, {})
            });
        }

        next();
    }
]
