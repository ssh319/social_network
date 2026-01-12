import mongoose from 'mongoose';

import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';

import {
    AccessDeniedError,
    NoSuchUserError
} from '../errors/chatErrors.js';


/**
 * Get all chats of the provided user.
 * 
 * @param {String} userId User's `ObjectId`.
 * @returns {Promise<Array>} List of user's chats.
 * 
 * @todo Get last message from array. (For chat preview)
 */
export const retrieveChats = async (userId) => {
    const chats = await Chat.find(
        { $or: [
            { primaryUser: userId },
            { secondaryUser: userId }
        ] },

        // not include all the messages for every chat
        { messages: 0 }

    ).populate({
        path: 'primaryUser',
        select: ['firstName', 'lastName', 'profilePicture']
    }).populate({
        path: 'secondaryUser',
        select: ['firstName', 'lastName', 'profilePicture']
    });

    return chats;
}


/**
 * Retrieve full chat info which the user is participant of.
 * 
 * @param {String} chatId `ObjectId` of a required chat.
 * @returns {Promise<Object>} Chat info including all of its messages.
 */
export const getChat = async (chatId) => {
    const chat = await Chat.findById(chatId);

    return chat;
}


/**
 * Get or create a chat between provided users.
 * 
 * @param {String} primaryUser `ObjectId` of a user starting the chat.
 * @param {String} secondaryUser `ObjectId` of a user which to start chat with.
 * @returns {Promise<String>} `ObjectId` of an existing or created chat.
 */
export const startChat = async (primaryUser, secondaryUser) => {

    const existingChat = await Chat.findOne({
        $or: [
            { $and: [
                { primaryUser },
                { secondaryUser }
            ] },

            { $and: [
                { secondaryUser: primaryUser },
                { primaryUser: secondaryUser }
            ] }
        ]
    });

    if (existingChat) {
        return {
            chat: existingChat._id,
            isNewChat: false
        };
    }

    const existingUser = await User.findById(secondaryUser);

    if (!existingUser) {
        throw new NoSuchUserError("No such user to start a chat with", "secondaryUser");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { _id } = await Chat.create([{ primaryUser, secondaryUser }], { session });

        await User.findByIdAndUpdate(primaryUser, { $push: { chats: _id } }, { session });
        await User.findByIdAndUpdate(secondaryUser, { $push: { chats: _id } }, { session });
        
        await session.commitTransaction();

        return {
            chat: _id,
            isNewChat: true
        };
        
    } finally {
        await session.endSession();
    }
}


/**
 * Completely erase the chat for both users.
 * 
 * @param {String} chatId `ObjectId` of the chat to be deleted
 */
export const deleteChat = async (chatId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const chat = await Chat.findByIdAndDelete(chatId, { session });

        await User.findByIdAndUpdate(chat.primaryUser, {
            $pull: { chats: chat._id }
        }, { session });

        await User.findByIdAndUpdate(chat.secondaryUser, {
            $pull: { chats: chat._id }
        }, { session });

        await session.commitTransaction();

    } finally {
        await session.endSession();
    }
}


/**
 * Add message to the provided chat.
 * 
 * @param {String} userId `ObjectId` of the messsage sender.
 * @param {String} chatId `ObjectId` of the chat.
 * @param {String} text Validated message text.
 */
export const sendMessage = async (userId, chatId, text) => {
    await Chat.findByIdAndUpdate(chatId, {
        $push: {
            messages: {
                user: userId,
                text
            }
        }
    });
}


/**
 * Update the provided message's text.
 * 
 * @param {String} chatId `ObjectId` of the chat.
 * @param {String} messageId `ObjectId` of the message to be edited.
 * @param {String} text Validated message text.
 */
export const editMessage = async (chatId, messageId, text) => {
    const chat = await Chat.findById(chatId);
    const message = chat.messages.id(messageId);

    message.set({ text });

    await chat.save();
}


/**
 * Erase message for both chat participants.
 * 
 * @param {String} chatId `ObjectId` of the chat.
 * @param {String} messageId `ObjectId` of the message to be deleted.
 */
export const deleteMessage = async (chatId, messageId) => {
    await Chat.findByIdAndUpdate(chatId, {
        $pull: { messages: { _id: messageId } }
    });
}


/**
 * Mark received message as read.
 * 
 * @param {String} chatId `ObjectId` of the chat.
 * @param {String} messageId `ObjectId` of the message to be marked as read.
 */
export const readMessage = async (userId, chatId, messageId) => {
    const chat = await Chat.findById(chatId);
    const message = chat.messages.id(messageId);

    if (message.user.equals(userId)) {
        throw new AccessDeniedError("You cannot mark as read your own message", "messageId");
    }

    message.set({ isRead: true });

    await chat.save();
}
