import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';

import {
    initDb,
    closeDb,
    createTestUsers,
    createTestChat
} from './dbUtils.js';

import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';


const notExistingId = "00aa11bb22cc33dd44ee55ff";

// invalid id & not found errs to separate function
// const checkId = async (route) => {}
// test("should ...", checkId);

let exampleUserId;
let exampleFriendId;
let exampleChatId;
let exampleMessageId;
let userToken;
let friendToken;

beforeAll(async () => {
    await initDb();
    
    const usersCreationResult = await createTestUsers();

    exampleUserId = usersCreationResult.exampleUserId;
    exampleFriendId = usersCreationResult.exampleFriendId;
    userToken = usersCreationResult.userToken;
    friendToken = usersCreationResult.friendToken;
});

beforeEach(async () => {
    const chatCreationResult = await createTestChat(exampleUserId, exampleFriendId);
    
    exampleChatId = chatCreationResult.exampleChatId;
    exampleMessageId = chatCreationResult.exampleMessageId;
});

afterEach(async () => {
    await mongoose.connection.dropCollection('chats');
});

afterAll(async () => {
    await closeDb();
});


describe("Chat API endpoints", () => {
    
    describe("retrieveChats", () => {

        test("should return user's chats in body with example chat as 1st element", async () => {
            const response = await request(app)
                .get('/chats')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty("chats");
            expect(response.body.chats).toBeInstanceOf(Array);
            expect(response.body.chats).toHaveLength(1);

            const exampleChat = response.body.chats[0];
            
            expect(exampleChat).toHaveProperty("_id", exampleChatId);
            expect(exampleChat).toHaveProperty("primaryUser._id", exampleUserId);
            expect(exampleChat).toHaveProperty("secondaryUser._id", exampleFriendId);
            expect(exampleChat).not.toHaveProperty("messages");
        });

        test("should return friend's chats in body with example chat as 1st element", async () => {
            const response = await request(app)
                .get('/chats')
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty("chats");
            expect(response.body.chats).toBeInstanceOf(Array);
            expect(response.body.chats).toHaveLength(1);

            const exampleChat = response.body.chats[0];

            expect(exampleChat).toHaveProperty("_id", exampleChatId);
            expect(exampleChat).toHaveProperty("primaryUser._id", exampleUserId);
            expect(exampleChat).toHaveProperty("secondaryUser._id", exampleFriendId);
            expect(exampleChat).not.toHaveProperty("messages");
        });

    });

    describe("getChat", () => {

        test("should return a chat object for example user", async () => {
            const response = await request(app)
                .get(`/chats/${exampleChatId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty("chat");

            expect(response.body.chat).toHaveProperty("messages");
            expect(response.body.chat.messages).toBeInstanceOf(Array);
            expect(response.body.chat.messages[0]).toHaveProperty("user", exampleUserId);
        });

        test("should return a chat object for example friend", async () => {
            const response = await request(app)
                .get(`/chats/${exampleChatId}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty("chat");

            expect(response.body.chat).toHaveProperty("messages");
            expect(response.body.chat.messages).toBeInstanceOf(Array);
            expect(response.body.chat.messages[0]).toHaveProperty("user", exampleUserId);
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .get('/chats/111')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such chat' error", async () => {
            const response = await request(app)
                .get(`/chats/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no chat access' error", async () => {
            const { _id } = await Chat.create({
                primaryUser: exampleUserId,
                secondaryUser: notExistingId
            });

            const response = await request(app)
                .get(`/chats/${_id}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");
        });

    });

    describe("startChat", () => {
        test("should return created chat id", async () => {
            const { _id } = await User.create({
                email: 'chattest@testmail.com',
                password: '12345678',
                firstName: 'Chat',
                lastName: 'Test',
            });

            const response = await request(app)
                .post(`/chats/${_id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(201);
        });

        test("should return existing chat id for example user", async () => {
            const response = await request(app)
                .post(`/chats/${exampleFriendId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty("chat", exampleChatId);
        });

        test("should return existing chat id for example friend", async () => {
            const response = await request(app)
                .post(`/chats/${exampleUserId}`)
                .set('Authorization', `Bearer ${friendToken}`);
 
            expect(response.status).toEqual(200);

            expect(response.body).toHaveProperty("chat", exampleChatId);
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .post('/chats/111')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such user' error", async () => {
            const response = await request(app)
                .post(`/chats/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

    });

    describe("deleteChat", () => {
        test("should remove the example chat from db by example user request", async () => {
            const response = await request(app)
                .delete(`/chats/${exampleChatId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);
            
            const deletedChat = await Chat.findById(exampleChatId);

            expect(deletedChat).toBeNull();

            const user = await User.findById(exampleUserId);
            const friend = await User.findById(exampleFriendId);

            expect(user.chats.some(chat => chat._id.equals(exampleChatId))).toBeFalsy();
            expect(friend.chats.some(chat => chat._id.equals(exampleChatId))).toBeFalsy();
        });

        test("should remove the example chat from db by example friend request", async () => {
            const response = await request(app)
                .delete(`/chats/${exampleChatId}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const deletedChat = await Chat.findById(exampleChatId);

            expect(deletedChat).toBeNull();

            const user = await User.findById(exampleUserId);
            const friend = await User.findById(exampleFriendId);

            expect(user.chats.some(chat => chat.equals(exampleChatId))).toBeFalsy();
            expect(friend.chats.some(chat => chat.equals(exampleChatId))).toBeFalsy();
        });

        test("should respond with 'no chat access' error", async () => {
            const { _id } = await Chat.create({
                primaryUser: exampleUserId,
                secondaryUser: notExistingId
            });

            const response = await request(app)
                .delete(`/chats/${_id}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");

            const chat = Chat.findById(exampleChatId);

            expect(chat).not.toBeNull();

            const user = await User.findById(exampleUserId);
            const friend = await User.findById(exampleFriendId);

            expect(user.chats.some(chat => chat.equals(exampleChatId))).toBeTruthy();
            expect(friend.chats.some(chat => chat.equals(exampleChatId))).toBeTruthy();
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .delete('/chats/111')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such chat' error", async () => {
            const response = await request(app)
                .delete(`/chats/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

    });

    describe("sendMessage", () => {
        test("should push a message to the example chat", async () => {
            const response = await request(app)
                .post(`/chats/${exampleChatId}/messages`)
                .send({
                    text: "Test message"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(201);

            const chat = await Chat.findById(exampleChatId);

            expect(chat.messages).toHaveLength(2);
            expect(chat.messages[1].user.equals(exampleUserId));
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .post('/chats/111/messages')
                .send({
                    text: "Test message"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such chat' error", async () => {
            const response = await request(app)
                .post(`/chats/${notExistingId}/messages`)
                .send({
                    text: "Test message"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no chat access' error", async () => {
            const { _id } = await Chat.create({
                primaryUser: exampleUserId,
                secondaryUser: notExistingId
            });

            const response = await request(app)
                .post(`/chats/${_id}/messages`)
                .send({
                    text: "Test message"
                })
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with message data validation errors", async () => {
            const response = await request(app)
                .post(`/chats/${exampleChatId}/messages`)
                .send({
                    text: "m".repeat(1001)
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("path", "text");
            expect(response.body.errors).toHaveLength(1);
        });

        test("should respond with 'invalid data type' error", async () => {
            const response = await request(app)
                .post(`/chats/${exampleChatId}/messages`)
                .send({
                    text: 1
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("path", "text");
            expect(response.body.errors).toHaveLength(1);
        });

        test("should respond with 'unexpected fields' error", async () => {
            const response = await request(app)
                .post(`/chats/${exampleChatId}/messages`)
                .send({
                    text: "Test message",
                    unexpectedField: "value"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("msg");
            expect(response.body.errors).toHaveLength(1);
        });

    });

    describe("editMessage", () => {
        test("should set a new text for the message", async () => {
            const response = await request(app)
                .patch(`/chats/${exampleChatId}/messages/${exampleMessageId}`)
                .send({
                    text: "Edited message text"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);

            const chat = await Chat.findById(exampleChatId);
            const message = chat.messages.id(exampleMessageId);

            expect(message.text).toEqual("Edited message text");
        });

        test("should respond with data validation errors list", async () => {
            const response = await request(app)
                .patch(`/chats/${exampleChatId}/messages/${exampleMessageId}`)
                .send({
                    text: "m".repeat(1001)
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
            
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("path", "text");
            expect(response.body.errors).toHaveLength(1);
        });

        test("should respond with 'invalid data type' error", async () => {
            const response = await request(app)
                .patch(`/chats/${exampleChatId}/messages/${exampleMessageId}`)
                .send({
                    text: 1
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
            
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("path", "text");
            expect(response.body.errors).toHaveLength(1);
        });

        test("should respond with 'unexpected fields' error", async () => {
            const response = await request(app)
                .patch(`/chats/${exampleChatId}/messages/${exampleMessageId}`)
                .send({
                    text: "Edited message text",
                    unexpectedField: "value"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
            
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("msg");
            expect(response.body.errors).toHaveLength(1);
        });

        test("should respond with 'no chat access' error", async () => {
            const { _id } = await Chat.create({
                primaryUser: exampleUserId,
                secondaryUser: notExistingId
            });

            const response = await request(app)
                .patch(`/chats/${_id}/messages/${notExistingId}`)
                .send({
                    text: "Edited message text"
                })
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no message access' error", async () => {
            const response = await request(app)
                .patch(`/chats/${exampleChatId}/messages/${exampleMessageId}`)
                .send({
                    text: "Edited message text"
                })
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'invalid id' errors", async () => {
            const invalidChatIdResponse = await request(app)
                .patch(`/chats/111/messages/${notExistingId}`)
                .send({
                    text: "Edited message text"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(invalidChatIdResponse.status).toEqual(400);
            expect(invalidChatIdResponse.body).toHaveProperty("message");

            const invalidMessageIdResponse = await request(app)
                .patch(`/chats/${exampleChatId}/messages/111`)
                .send({
                    text: "Edited message text"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(invalidMessageIdResponse.status).toEqual(400);
            expect(invalidMessageIdResponse.body).toHaveProperty("message");
        });

        test("should respond with 'no such chat' error", async () => {
            const response = await request(app)
                .patch(`/chats/${notExistingId}/messages/${notExistingId}`)
                .send({
                    text: "Edited message text"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such message' error", async () => {
            const response = await request(app)
                .patch(`/chats/${exampleChatId}/messages/${notExistingId}`)
                .send({
                    text: "Edited message text"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

    });

    describe("deleteMessage", () => {
        test("should remove the message from chat", async () => {
            const response = await request(app)
                .delete(`/chats/${exampleChatId}/messages/${exampleMessageId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);

            const chat = await Chat.findById(exampleChatId);
            const message = chat.messages.id(exampleMessageId);

            expect(message).toBeNull();
        });

        test("should respond with 'no chat access' error", async () => {
            const { _id } = await Chat.create({
                primaryUser: exampleUserId,
                secondaryUser: notExistingId
            });

            const response = await request(app)
                .delete(`/chats/${_id}/messages/${notExistingId}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no message access' error", async () => {
            const response = await request(app)
                .delete(`/chats/${exampleChatId}/messages/${exampleMessageId}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'invalid id' errors", async () => {
            const invalidChatIdResponse = await request(app)
                .delete(`/chats/111/messages/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(invalidChatIdResponse.status).toEqual(400);
            expect(invalidChatIdResponse.body).toHaveProperty("message");

            const invalidMessageIdResponse = await request(app)
                .delete(`/chats/${exampleChatId}/messages/111`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(invalidMessageIdResponse.status).toEqual(400);
            expect(invalidMessageIdResponse.body).toHaveProperty("message");
        });

        test("should respond with 'no such chat' error", async () => {
            const response = await request(app)
                .delete(`/chats/${notExistingId}/messages/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such message' error", async () => {
            const response = await request(app)
                .delete(`/chats/${exampleChatId}/messages/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });
        
    });

    describe("readMessage", () => {
        test("should mark the provided message as read", async () => {
            const response = await request(app)
                .patch(`/chats/${exampleChatId}/messages/${exampleMessageId}/read`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const chat = await Chat.findById(exampleChatId);
            const message = chat.messages.id(exampleMessageId);

            expect(message.isRead).toEqual(true);
        });

        test("should respond with 'cannot mark as read your own message' error", async () => {
            const response = await request(app)
                .patch(`/chats/${exampleChatId}/messages/${exampleMessageId}/read`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");

            const chat = await Chat.findById(exampleChatId);
            const message = chat.messages.id(exampleMessageId);

            expect(message.isRead).toEqual(false);
        });

        test("should respond with 'invalid id' errors", async () => {
            const invalidChatIdResponse = await request(app)
                .patch(`/chats/111/messages/${notExistingId}/read`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(invalidChatIdResponse.status).toEqual(400);
            expect(invalidChatIdResponse.body).toHaveProperty("message");

            const invalidMessageIdResponse = await request(app)
                .patch(`/chats/${exampleChatId}/messages/111`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(invalidMessageIdResponse.status).toEqual(400);
            expect(invalidMessageIdResponse.body).toHaveProperty("message");
        });

        test("should respond with 'no such chat' error", async () => {
            const response = await request(app)
                .patch(`/chats/${notExistingId}/messages/${notExistingId}/read`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such message' error", async () => {
            const response = await request(app)
                .patch(`/chats/${exampleChatId}/messages/${notExistingId}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no chat access' error", async () => {
            const { _id } = await Chat.create({
                primaryUser: exampleUserId,
                secondaryUser: notExistingId
            });

            const response = await request(app)
                .patch(`/chats/${_id}/messages/${notExistingId}/read`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");
        });

    });

});
