import request from 'supertest';

import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// get JWT_SECRET_KEY
dotenv.config();

import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import Chat from '../models/chatModel.js';
// import Image from '../models/imageModel.js';

import app from '../app.js';


let replset;

export const initDb = async () => {
    replset = await MongoMemoryReplSet.create({
        replSet: {
            count: 4,
            storageEngine: 'wiredTiger'
        } 
    });
    
    const uri = replset.getUri();
    await mongoose.connect(uri);
}


export const closeDb = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await replset.stop();
}


export const createTestUsers = async () => {
    const userPassword = await bcrypt.hash("12345678", 10);
    
    const user = await User.create({
        email: "example@testmail.com",
        password: userPassword,
        firstName: "User",
        lastName: "Example"
    });
    
    const exampleUserId = user._id.toHexString();
    

    const friendPassword = await bcrypt.hash("12345678", 10);

    const friend = await User.create({
        email: "friendexample@testmail.com",
        password: friendPassword,
        firstName: "Friend",
        lastName: "Example"
    });

    const exampleFriendId = friend._id.toHexString();


    await User.findByIdAndUpdate(exampleUserId, { $push: { friends: { user: exampleFriendId, status: 'friend' } } });
    await User.findByIdAndUpdate(exampleFriendId, { $push: { friends: { user: exampleUserId, status: 'friend' } } });
    
    const userToken = jwt.sign({ _id: exampleUserId }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    const friendToken = jwt.sign({ _id: exampleFriendId }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    
    return {
        exampleUserId,
        exampleFriendId,
        userToken,
        friendToken
    };
}


export const createTestPost = async (userId) => {
    const post = await Post.create({
        user: userId,
        text: "Post example"
    });
    
    const examplePostId = post._id.toHexString();

    const commentedPost = await Post.findByIdAndUpdate(examplePostId, {
        $push: {
            comments: {
                text: "Post comment example",
                user: userId
            }
        }
    }, { new: true });

    const exampleCommentId = commentedPost.comments[0]._id.toHexString();

    await User.findByIdAndUpdate(userId, {
        $push: { posts: examplePostId }
    });
    
    return {
        examplePostId,
        exampleCommentId
    };
}


export const createTestChat = async (userId, friendId) => {
    const chat = await Chat.create({
        primaryUser: userId,
        secondaryUser: friendId
    });

    const exampleChatId = chat._id.toHexString();

    const message = chat.messages.create({ user: userId, text: "Message example" });
    const exampleMessageId = message._id.toHexString();

    chat.messages.push(message);
    
    await chat.save();

    await User.findByIdAndUpdate(userId, {
        $push: { chats: exampleChatId }
    });

    await User.findByIdAndUpdate(friendId, {
        $push: { chats: exampleChatId }
    });

    return {
        exampleChatId,
        exampleMessageId
    };
}


// const createTestImage = async (userId) => {
//     const pngImage = await Image.create({
//         user: userId,
//         path: "../?/pngExampleImage.png",
//         contentType: "image/png"
//     });

//     const jpegImage = await Image.create({
//         user: userId,
//         path: "../?/jpegExampleImage.jpeg",
//         contentType: "image/jpeg"
//     });

//     const examplePngImageId = pngImage._id.toHexString();
//     const exampleJpegImageId = jpegImage._id.toHexString();

//     return {
//         examplePngImageId,
//         exampleJpegImageId
//     };
// }


export const checkInvalidId = async (method, route, token) => {
    const response = await request(app)
        [method](route)
        .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("message");
}


export const checkNotFound = async (method, route, token) => {
    const response = await request(app)
        [method](route)
        .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty("message");
}
