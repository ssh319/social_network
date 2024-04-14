import { isValidObjectId } from 'mongoose';
import { body, checkExact, validationResult } from 'express-validator';

import Chat from '../models/chatModel.js';


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


export const validateChatAccess = async (request, response, next) => {
    const chat = await Chat.findById(request.params.chatId);
    
    if (!(chat.primaryUser.equals(request.user._id) || chat.secondaryUser.equals(request.user._id))) {
        return response.status(403).json({ message: "Access to chat denied" });
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
                validationErrors.errors.map(({ msg }) => { return { msg } })
            );
        }

        next();
    }
]
