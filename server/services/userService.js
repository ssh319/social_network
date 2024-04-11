import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from '../models/userModel.js';
// import Post from '../models/postModel.js';
// import Chat from '../models/chatModel.js';
// import Image from '../models/imageModel.js';

import {
    NotFoundError,
    IncorrectPasswordError,
    AlreadyExistsError
} from '../errors/userErrors.js';


/**
 * 
 * @param {object} query Search parameters.
 * @returns {Promise<Array>} Array of matching users.
 */
export const searchUsers = async (query) => {

    // birthDate (age field?)
    // query.age = { $gte: query.minBirthDate, $lte: query.maxBirthDate };

    // const result = await User.find(
    //     query,
    //     { _id: 1, firstName: 1, lastName: 1, profilePicture: 1 },
    // );

    console.log(query);

    // return result;
}


/**
 * Get all of the public user data by ObjectId.
 * 
 * @param {string} id User's ObjectId
 * @returns {Promise<object>} Public data of the requested user.
 */
export const getUser = async (id) => {
    
    const user = await User.findById(
        id,
        { email: 0, password: 0, createdAt: 0, chats: 0 }
    ).populate({
        path: 'friends.user',
        select: ['firstName', 'lastName', 'profilePicture']
    });

    if (!user) {
        throw new NotFoundError("Such user doesn't exist");
    }
    
    user.friends = user.friends.filter(friend => friend.status === 'friend');

    return user;
}


/**
 * User sign up data validation and inserting it into the MongoDB.
 * 
 * @param {object} data Object, containing validated user e-mail, password, first & last name, and the rest of optional data.
 * @returns {Promise<object>} Result of document creation as object.
 */
export const createUser = async (data) => {

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
        throw new AlreadyExistsError("This email address is already in use");
    }
    
    const saltRounds = 10;
    
    const hash = await bcrypt.hash(data.password, saltRounds);
    data.password = hash;

    const result = await User.create(data);

    return result;
}


/**
 * Define which user is logging in, check the tried password and respond with a token for further authorization.
 * 
 * @param {string} email Validated lowercased email address of an existing user.
 * @param {string} password Password for the corresponding user.
 * @returns {Promise<string>} Obtained JWT token.
 */
export const authenticateUser = async (email, password) => {

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    
    const retrievedUser = await User.findOne({ email });

    if (!retrievedUser) {
        throw new NotFoundError("User with such email doesn't exist");
    }

    const comparisonResult = await bcrypt.compare(password, retrievedUser.password);

    if (comparisonResult !== true) {
        throw new IncorrectPasswordError("Incorrect password");
    }
    
    const { _id } = retrievedUser;
    const token = jwt.sign({ _id }, jwtSecretKey, { expiresIn: "7d" });

    return token;
}


/**
 * Update the provided user's data fields.
 * 
 * @param {string} userId User's ObjectId
 * @param {object} data Object, containing the user data updates.
 */
export const updateUser = async (userId, data) => {
    // user can change password and still have an access using same token (if the change was from another device?)

    const user = await User.findById(userId);

    if (data.email) {
        if (user.email === data.email) {
            throw new AlreadyExistsError("This is your email address already");
        }

        const existingUser = await User.findOne({ email: data.email });
        
        if (existingUser) {
            throw new AlreadyExistsError("Provided email address is already in use");
        }
    }

    if (data.password) {
        const comparisonResult = await bcrypt.compare(data.oldPassword, user.password);

        if (comparisonResult !== true) {
            throw new IncorrectPasswordError("Incorrect old password");
        }

        const saltRounds = 10;
        
        const hash = await bcrypt.hash(data.password, saltRounds);
        data.password = hash;
    }

    user.set(data);

    await user.save();
}


/**
 * Delete the user from database and clear all of its resources.
 * 
 * @param {string} userId User's ObjectId
 */
export const deleteUser = async (userId) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // await Post.deleteMany({ userId }, { session });

        // await Image.deleteMany({ userId }, { session });

        // await Chat.deleteMany({
        //     $or: [
        //         { primaryUser: userId },
        //         { secondaryUser: userId }
        //     ]
        // }, { session });

        await User.findByIdAndDelete(userId, { session });

        await session.commitTransaction();

    } finally {
        await session.endSession();
    }
}

/**
 * 
 * @param {string} userId ObjectId of a current user.
 */
export const updateOnline = async (userId) => {
    await User.findByIdAndUpdate(userId, { lastActive: new Date() });
}


/**
 * Add current user id and request receiver id to each others' friends
 * arrays with 'received' and 'sent' statuses respectively.
 * 
 * @param {string} userId ObjectId of a current user.
 * @param {string} requestReceiverId Friend request receiver's User's ObjectId
 */
export const addFriend = async (userId, requestReceiverId) => {
    
    if (userId === requestReceiverId) {
        // AlreadyExistsError?
        throw new AlreadyExistsError("Provided user id is your own");
    }
    
    const requestReceiver = await User.findById(requestReceiverId);
    
    if (!requestReceiver) {
        throw new NotFoundError("No such user to send friend request to");
    }

    const userInFriendsList = requestReceiver.friends.find(friend => friend.user.equals(userId));

    if (userInFriendsList) {
        let message;

        switch (userInFriendsList.status) {
            case 'friend':
                message = "This user is already your friend";
                break;
            
            case 'received':
                message = "The user has already received your request";
                break;

            case 'sent':
                message = "This user has sent friend request to you. You can accept it instead";
                break;
            }

        throw new AlreadyExistsError(message);
    }

    requestReceiver.friends.push({ user: userId, status: 'received' });

    const session = await User.startSession();
    session.startTransaction();

    try {
        await requestReceiver.save({ session });

        await User.findByIdAndUpdate(
            userId,
            { $push: { friends: { user: requestReceiverId, status: 'sent' } } },
            { session }
        );

        await session.commitTransaction();

    } finally {
        await session.endSession();
    }
}


/**
 * Remove id's from each others' received and sent requests arrays, and add them to friend lists if the request is accepted.
 * 
 * @param {string} userId ObjectId id of a current user.
 * @param {string} requestSenderId ObjectId id of a user, whose friend request will be answered.
 */
export const acceptFriend = async (userId, requestSenderId) => {

    const user = await User.findById(userId);
    const requestSender = await User.findById(requestSenderId);

    const receivedRequestIndex = user.friends.findIndex(friend => (
        friend.user.equals(requestSenderId) && friend.status === 'received'
    ));

    if (receivedRequestIndex === -1) {
        throw new NotFoundError("There is no received friend request from such user");
    }

    const sentRequestIndex = requestSender.friends.findIndex(friend => (
        friend.user.equals(userId) && friend.status === 'sent'
    ));

    // userId were being deleted by set() (when no userId provided)
    user.friends.set(receivedRequestIndex, { user: requestSenderId, status: 'friend' });
    requestSender.friends.set(sentRequestIndex, { user: userId, status: 'friend' });

    const session = await User.startSession();
    session.startTransaction();

    try {
        await user.save({ session });
        await requestSender.save({ session });

        await session.commitTransaction();

    } finally {
        await session.endSession();
    }
}


/**
 * Remove provided friend or friend request sender/receiver from friends list.
 * 
 * @param {string} userId ObjectId of a current user.
 * @param {string} friendId ObjectId of the user which will be deleted from friends.
 */
export const removeFriend = async (userId, friendId) => {

    const user = await User.findById(userId);

    const isInFriends = user.friends.some(friend => friend.user.equals(friendId));

    if (!isInFriends) {
        throw new NotFoundError("There is no such user in your friends list");
    }

    user.friends.pull({ user: friendId });

    const session = await User.startSession();
    session.startTransaction();

    try {
        await user.save({ session });
        await User.findByIdAndUpdate(
            friendId, 
            { $pull: { friends: { user: userId } } },
            { session }
        );

        await session.commitTransaction();

    } finally {
        await session.endSession();
    }
}
