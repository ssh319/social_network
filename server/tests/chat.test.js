import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';

import {
    initDb,
    closeDb,
    createTestUsers,
    createTestChat
} from './dbUtils.js';


const notExistingId = "00aa11bb22cc33dd44ee55ff";

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

        test("should ...", async () => {

        });

    });

});
