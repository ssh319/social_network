import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from '../models/userModel.js';

import {
    NotFoundError,
    IncorrectPasswordError,
    AlreadyExistsError
} from '../errors/userErrors.js';


// export const searchUsers = async (query) => {
//     userValidators.js => validateSearchQuery (query("age"), query("firstName")...)

//     const filter = ?; example: ({ age: { $gte: 20 } })
//     const result = await User.find(query, { email: 0, password: 0 }); => User.aggregate({ $match: filter }); ?
//     upd: "$match is similar to find()"
//     ???

//     console.log(result);

//     return result || []; (if result !== [] already)
// }


/**
 * Get all of the public user data by ObjectId.
 * 
 * @param {string} id User's ObjectId
 * @returns {Promise<object>} All the public data of requested user.
 */
export const getUser = async (id) => {
    // retrieveFriends route & controller & service?

    const result = await User.findById(id, { email: 0, password: 0, createdAt: 0 });

    if (!result) {
        throw new NotFoundError("Provided user doesn't exist");
    }

    result.friends = result.friends.filter(friend => friend.status === 'friend');

    return result;
}


/**
 * User sign up data validation and inserting it into the MongoDB.
 * 
 * @param {object} data Object, containing validated user e-mail, password, first & last name, and the rest of optional data.
 * @returns {Promise<object>} Result of mongoose's 'create' method containing the inserted document as object.
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
    // console.log(result);

    return result;
}


/**
 * Define which user wishes to log in, check the tried password and respond with a token for further authorization.
 * 
 * @param {string} email Validated, lowered email address of an existing user.
 * @param {string} password Login password for the corresponding user.
 * @returns {Promise<string>} Obtained JWT token.
 */
export const authenticateUser = async (email, password) => {

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    
    const retrievedUser = await User.findOne({ email });

    if (!retrievedUser) {
        throw new NotFoundError("User with such email doesn't exist");
    }

    const result = await bcrypt.compare(password, retrievedUser.password);

    if (result !== true) {
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

    if (data.email) {
        const existingUser = await User.findOne({ email: data.email });

        if (existingUser) {

            if (existingUser._id.equals(userId)) {
                throw new AlreadyExistsError("This is your current email address");
            }

            throw new AlreadyExistsError("Provided email address is already in use");
        }
    }

    if (data.password) {
        const saltRounds = 10;
        
        const hash = await bcrypt.hash(data.password, saltRounds);
        data.password = hash;
    }

    await User.findByIdAndUpdate(userId, data);
}


/**
 * Delete the user from database and clear all of its resources.
 * 
 * @param {string} userId User's ObjectId
 */
export const deleteUser = async (userId) => {

    // Post.deleteMany({ userId });
    // Image.deleteMany({ userId });
    // Chat.deleteMany({ userId (primary or secondary user ($or?)) });

    await User.findByIdAndDelete(userId);
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
    
    const requestReceiver = await User.findById(requestReceiverId);
    
    if (!requestReceiver) {
        throw new NotFoundError("No such user to send friend request to");
    }

    const userInFriendsList = requestReceiver.friends.find(friend => friend.userId.equals(userId));
    
    if (userInFriendsList) {

        if (userInFriendsList.status === 'friend') {
            throw new AlreadyExistsError("This user is already your friend");

        } else if (userInFriendsList.status === 'received') {
            throw new AlreadyExistsError("The user has already received your request");

        } else if (userInFriendsList.status === 'sent') {
            throw new AlreadyExistsError("This user has sent friend request to you. You can accept it instead");
        }
    }

    requestReceiver.friends.push({ userId, status: 'received' });

    const session = await User.startSession();
    session.startTransaction();

    try {

        await requestReceiver.save({ session });
        await User.findByIdAndUpdate(
            userId,
            { $push: { friends: { userId: requestReceiverId, status: 'sent' } } },
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
        friend.userId.equals(requestSenderId) && friend.status === 'received'
    ));

    if (receivedRequestIndex === -1) {
        throw new NotFoundError("There is no received friend request from such user");
    }

    const sentRequestIndex = requestSender.friends.findIndex(friend => (
        friend.userId.equals(userId) && friend.status === 'sent'
    ));

    // userId were being deleted by set() (when no userId provided)
    user.friends.set(receivedRequestIndex, { userId: requestSenderId, status: 'friend' });
    requestSender.friends.set(sentRequestIndex, { userId, status: 'friend' });

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

    const isInFriends = user.friends.some(friend => friend.userId.equals(friendId));

    if (!isInFriends) {
        throw new NotFoundError("There is no such user in your friends list");
    }

    user.friends.pull({ userId: friendId });

    const session = await User.startSession();
    session.startTransaction();

    try {
        await user.save({ session });
        await User.findByIdAndUpdate(
            friendId, 
            { $pull: { friends: { userId } } },
            { session }
        );

        await session.commitTransaction();

    } finally {
        await session.endSession();
    }
}
