import * as service from '../services/chatService.js';

import {
    NotFoundError
} from '../errors/chatErrors.js';


export const retrieveChats = async (request, response) => {
    try {
        const chats = await service.retrieveChats(request.user._id);
        response.status(200).json({ chats });

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: "Unknown internal error occured" });
    }
}


export const getChat = async (request, response) => {
    try {
        const chat = await service.getChat(request.params.chatId);
        // or in service?
        // if (!(chat.primaryUser.equals(request.user._id) || chat.secondaryUser.equals(request.user._id))) {
        //     return response.status(403).json({ message: "You don't have a permission to participate in this chat" })
        // }
        response.status(200).json({ chat });

    } catch (err) {
        const { message } = err;

        if (err instanceof NotFoundError) {
            response.status(404);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}


export const startChat = async (request, response) => {
    try {
        const chat = await service.startChat(request.user._id, request.params.userId);
        response.status(201).json({ chat });

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: "Unknown internal error occured" });
    }
}


export const deleteChat = async (request, response) => {
    try {
        await service.deleteChat(request.params.chatId);
        response.sendStatus(200);

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: "Unknown internal error occured" });
    }
}



export const sendMessage = async (request, response) => {
    // user already has access?
    try {
        await service.sendMessage(request.params.chatId, request.body.text);
        response.sendStatus(201);

    } catch (err) {
        console.error(err);
        response.status(500).json({ message: "Unknown internal error occured" });
    }
}


export const editMessage = async (request, response) => {
    try {
        await service.editMessage(request.params.chatId, request.params.messageId, request.body.text);
        response.sendStatus(200);

    } catch (err) {
        const { message } = err;

        if (err instanceof NotFoundError) {
            response.status(404);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}


export const deleteMessage = async (request, response) => {
    try {
        await service.deleteMessage(request.params.chatId, request.params.messageId);
        response.sendStatus(200);

    } catch (err) {
        const { message } = err;

        if (err instanceof NotFoundError) {
            response.status(404);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}


export const readMessage = async (request, response) => {
    try {
        await service.readMessage(request.params.chatId, request.params.messageId);
        response.sendStatus(200);

    } catch (err) {
        const { message } = err;

        if (err instanceof NotFoundError) {
            response.status(404);

        } else {
            console.error(err);
            return response.status(500).json({ message: "Unknown internal error occured" });
        }

        response.json({ message });
    }
}
