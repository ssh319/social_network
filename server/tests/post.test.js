import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';

import {
    initDb,
    closeDb,
    createTestUsers,
    createTestPost
} from './dbUtils.js';


const notExistingId = "00aa11bb22cc33dd44ee55ff";

let exampleUserId;
let exampleFriendId;
let examplePostId;
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
    const postCreationResult = await createTestPost(exampleUserId);

    examplePostId = postCreationResult.examplePostId;
});

afterEach(async () => {
    await mongoose.connection.dropCollection('posts');
});

afterAll(async () => {
    await closeDb();
});


describe("Post API endpoints", () => {

    describe("getPostsFeed", () => {

        test("should return an array of posts by request user or its friends", async () => {
            const response = await request(app)
                .get('/posts/feed')
                .set('Content-Type', 'application/json')
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("posts");
            expect(Array.isArray(response.body.posts)).toEqual(true);
        });

    });

});