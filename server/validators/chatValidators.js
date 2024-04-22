import { isValidObjectId } from 'mongoose';
import { body, checkExact, validationResult } from 'express-validator';


export const validateChatId = (request, response, next) => {
    if (!isValidObjectId(request.params.chatId)) {
        return response.status(400).json({ message: "Invalid chat id provided" });
    }

    next();
}


export const validateMessageId = (request, response, next) => {
    if (!isValidObjectId(request.params.messageId)) {
        return response.status(400).json({ message: "Invalid message id provided" });
    }

    next();
}


export const validateMessage = [
    body("text")
        .isString().withMessage("Invalid data type for message text").bail()
        .notEmpty().withMessage("Empty message text provided").bail()
        .isLength({ max: 1024 }).withMessage("Message cannot be more than 1024 characters in length"),

    checkExact(),

    (request, response, next) => {

        const validationErrors = validationResult(request);

        if (!validationErrors.isEmpty()) {
            return response.status(400).json(
                validationErrors.errors.map(({ msg }) => { return { msg }; })
            );
        }

        next();
    }
]
