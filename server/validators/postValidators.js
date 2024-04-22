import { isValidObjectId } from 'mongoose';
import { body, checkExact, validationResult } from 'express-validator';


export const validatePostId = (request, response, next) => {
    if (!isValidObjectId(request.params.postId)) {
        return response.status(400).json({ message: "Invalid post id provided" });
    }

    next();
}


export const validateCommentId = (request, response, next) => {
    if (!isValidObjectId(request.params.commentId)) {
        return response.status(400).json({ message: "Invalid comment id provided" });
    }

    next();
}


export const validatePost = [
    // body("text")
    //     .isString().withMessage("Invalid data type for post text").bail()
    //     .notEmpty().withMessage("Post comment cannot be empty")
    //     .isLength({ max: 500 }).withMessage("Post comment cannot be more than 500 characters in length"),

    // is array of objectids
    // body("images")
    //     .isArray(),

    // checkExact(),

    (request, response, next) => {
    //     const validationErrors = validationResult(request);

    //     if (!validationErrors.isEmpty()) {
    //         return response.status(400).json(
    //             validationErrors.errors.map(({ msg }) => { return { msg }; })
    //         )
    //     }

        next();
    }
]


export const validateComment = [
    // body("text")
    //     .isString().withMessage("Invalid data type for post comment text").bail()
    //     .notEmpty().withMessage,

    // checkExact(),

    (request, response, next) => {
        // const validationErrors = validationResult(request);

        // if (!validationErrors.isEmpty()) {
        //     return response.status(400).json(
        //         validationErrors.errors.map(({ msg }) => ({ msg }))
        //     );
        // }

        next();
    }
]
