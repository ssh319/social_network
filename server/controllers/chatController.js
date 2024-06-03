import * as service from '../services/chatService.js';

import ClientError from '../errors/clientError.js';


export const retrieveChats = async (request, response, next) => {
    try {
        const chats = await service.retrieveChats(request.user._id);
        response.json({ chats });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const getChat = async (request, response, next) => {
    try {
        const chat = await service.getChat(request.params.chatId);
        response.json({ chat });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const startChat = async (request, response, next) => {
    try {
        const { chat, isNewChat } = await service.startChat(request.user._id, request.params.userId);
        response.status(isNewChat ? 201 : 200).json({ chat });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const deleteChat = async (request, response, next) => {
    try {
        await service.deleteChat(request.params.chatId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const sendMessage = async (request, response, next) => {
    try {
        await service.sendMessage(request.user._id, request.params.chatId, request.body.text);
        response.sendStatus(201);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const editMessage = async (request, response, next) => {
    try {
        await service.editMessage(request.params.chatId, request.params.messageId, request.body.text);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const deleteMessage = async (request, response, next) => {
    try {
        await service.deleteMessage(request.params.chatId, request.params.messageId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}


export const readMessage = async (request, response, next) => {
    try {
        await service.readMessage(request.user._id, request.params.chatId, request.params.messageId);
        response.sendStatus(200);

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            next(err);
        }
    }
}
