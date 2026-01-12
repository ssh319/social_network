import Chat from "../models/chatModel.js";


export const checkChatAccess = async (request, response, next) => {
    const chat = await Chat.findById(request.params.chatId);

    if (!chat) {
        return response.status(404).json({ errors: { globalError: "Provided chat doesn't exist" }});
    }

    if (![
        chat.primaryUser.equals(request.user._id),
        chat.secondaryUser.equals(request.user._id)
        ].some(isEqual => isEqual)
    ) {
        return response.status(403).json({ errors: { globalError: "Access to the chat denied" }});
    }
    
    next();
}


export const checkMessageAccess = async (request, response, next) => {
    const chat = await Chat.findById(request.params.chatId);

    if (!chat) {
        return response.status(404).json({ errors: { globalError: "Provided chat doesn't exist" }});
    }

    const message = chat.messages.id(request.params.messageId);

    if (!message) {
        return response.status(404).json({ errors: { globalError: "Such message doesn't exist in this chat" }});
    }

    if (!message.user.equals(request.user._id)) {
        return response.status(403).json({ errors: { globalError: "Provided message was not sent by you" }});
    }

    next();
}
