import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';

import {
    initDb,
    closeDb,
    createTestUsers,
    // createTestImage
} from './dbUtils.js';


const notExistingId = "00aa11bb22cc33dd44ee55ff";

// let exampleUserId;
// let exampleFriendId;
// let exampleImageId;
// let userToken;
// let friendToken;

// beforeAll(async () => {
//     await initDb();

//     const usersCreationResult = await createTestUsers();

//     exampleUserId = usersCreationResult.exampleUserId;
//     exampleFriendId = usersCreationResult.exampleFriendId;
//     userToken = usersCreationResult.userToken;
//     friendToken = usersCreationResult.friendToken;
// });

// beforeEach(async () => {
//     const imageCreationResult = await createTestImage(exampleUserId);

//     exampleImageId = imageCreationResult.exampleImageId;
// });

// afterEach(async () => {
//     await mongoose.connection.dropCollection('images');
// });

// afterAll(async () => {
//     await closeDb();
// });


describe("Image API endpoints", () => {

    describe("getImage", () => {

        test("...", async () => {

        });

    });

    describe("uploadImage", () => {

    });

    describe("deleteImage", () => {

    });

    describe("likeImage", () => {

    });

    describe("unlikeImage", () => {

    });
    
});
