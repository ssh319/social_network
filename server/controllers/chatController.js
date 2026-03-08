import * as service from '../services/chatService.js';
import { emitMessage } from '../socket/chat.js';
import { emitNotification } from '../socket/notifications.js';

import ClientError from '../errors/clientError.js';


export const retrieveChats = async (request, response, next) => {
    try {
        const chats = await service.retrieveChats(request.user._id);
        response.json({ chats });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

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
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const getOrCreateChat = async (request, response, next) => {
    try {
        const { chat, isNewChat } = await service.getOrCreateChat(request.user._id, request.params.userId);
        response.status(isNewChat ? 201 : 200).json({ chat });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

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
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}


export const sendMessage = async (request, response, next) => {
    try {
        const newMessage = await service.sendMessage(request.user._id, request.params.chatId, request.body.text);
        
        emitNotification(
            newMessage.receiverId,
            {
                type: 'message',
                messageText: request.body.text,
                sender: newMessage.sender,
                chat: request.params.chatId
            }
        );
        emitMessage(newMessage.receiverId, { ...newMessage, chat: request.params.chatId });
        response.status(201).json({ newMessage });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

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
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

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
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

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
            response.status(err.statusCode).json({ errors: { [err.path]: err.msg } });

        } else {
            next(err);
        }
    }
}
