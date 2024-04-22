import * as service from '../services/chatService.js';

import ClientError from '../errors/clientError.js';


export const retrieveChats = async (request, response) => {
    try {
        const chats = await service.retrieveChats(request.user._id);
        response.json({ chats });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const getChat = async (request, response) => {
    try {
        const chat = await service.getChat(request.params.chatId);
        response.json({ chat });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const startChat = async (request, response) => {
    try {
        const chat = await service.startChat(request.user._id, request.params.userId);
        response.status(201).json({ chat });

    } catch (err) {
        if (err instanceof ClientError) {
            response.status(err.statusCode).json({ message: err.message });

        } else {
            console.error(err);
            response.status(500).json({ message: "Unknown internal error occured" });
        }
    }
}


export const deleteChat = async (request, response) => {
    try {
        await service.deleteChat(request.params.chatId);
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


export const sendMessage = async (request, response) => {
    try {
        await service.sendMessage(request.user._id, request.params.chatId, request.body.text);
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


export const editMessage = async (request, response) => {
    try {
        await service.editMessage(request.params.chatId, request.params.messageId, request.body.text);
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


export const deleteMessage = async (request, response) => {
    try {
        await service.deleteMessage(request.params.chatId, request.params.messageId);
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


export const readMessage = async (request, response) => {
    try {
        await service.readMessage(request.user._id, request.params.chatId, request.params.messageId);
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
