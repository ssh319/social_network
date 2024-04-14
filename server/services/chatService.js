import Chat from '../models/chatModel.js';

import {
    NotFoundError
} from '../errors/chatErrors.js';


/**
 * 
 * @param {string} userId User's ObjectId.
 * @returns List of user's chats.
 */
export const retrieveChats = async (userId) => {
    // required to be returned: last message object (with text, timestamp, isRead) & primaryUser or secondaryUser (_id, firstName, lastName, profilePic)
    const chats = await Chat.find({
        $or: [
            { primaryUser: userId },
            { secondaryUser: userId }
        ]

    }).populate({
        path: 'primaryUser',
        // returns _id too?
        select: ['firstName', 'lastName', 'profilePicture']
    }).populate({
        path: 'secondaryUser',
        // _id?
        select: ['firstName', 'lastName', 'profilePicture']
    });
    // get only last messsage object?

    return chats;
}


/**
 * Retrieve the full chat info which the user is participant of.
 * 
 * @param {string} chatId Chat's id.
 * @returns Chat info including all the messages in it.
 */
export const getChat = async (chatId) => {
    // are msgs sorted?
    const chat = await Chat.findById(chatId);

    if (!chat) {
        throw new NotFoundError("Such chat doesn't exist");
    }
    // userId === chat.primaryUser || userId === chat.secondaryUser;

    return chat;
}


/**
 * Start messaging with secondary user as primary user.
 * 
 * @param {string} primaryUser ObjectId of a user starting the chat.
 * @param {string} secondaryUser ObjectId of a user which to start chat with.
 * @returns ?????????
 */
export const startChat = async (primaryUser, secondaryUser) => {
    /*const { _id } = */await Chat.create({ primaryUser, secondaryUser });
    // return _id;
}


/**
 * Completely erase the chat for both users.
 * 
 * @param {string} chatId ObjectId of the chat to be deleted
 */
export const deleteChat = async (chatId) => {
    await Chat.findByIdAndDelete(chatId);
}


/**
 * Add message to current chat messages' array.
 * 
 * @param {string} chatId ObjectId of a current chat.
 * @param {string} text Validated message text.
 */
export const sendMessage = async (chatId, text) => {
    const chat = await Chat.findById(chatId);
    // other fields auto?
    chat.messages.push({ text });

    await chat.save();
}


/**
 * Change target message's text without updating its timestamp.
 * 
 * @param {string} chatId ObjectId of a current chat.
 * @param {string} messageId ObjectId of the message to change.
 * @param {string} text Validated message text.
 */
export const editMessage = async (chatId, messageId, text) => {
    const chat = await Chat.findById(chatId);

    chat.messages.id(messageId).updateOne({ text });
}


/**
 * Erase message for both chat participants.
 * 
 * @param {string} chatId ObjectId of a current chat.
 * @param {string} messageId ObjectId of the message to be deleted.
 */
export const deleteMessage = async (chatId, messageId) => {
    // ???
    await Chat.findByIdAndUpdate(chatId, {
        $pull: { messages: { _id: messageId } }
    });
}


/**
 * Mark received message as read.
 * 
 * @param {string} chatId ObjectId of a current chat.
 * @param {string} messageId ObjectId of the message to be marked as read.
 */
export const readMessage = async (chatId, messageId) => {
    // validate that isn't own message
}
