import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';

import {
    initDb,
    closeDb,
    createTestUsers,
    // createTestImage,
    checkInvalidId,
    checkNotFound
} from './utils.js';


const notExistingId = "00aa11bb22cc33dd44ee55ff";

let exampleUserId;
let exampleFriendId;
let exampleImageId;
let userToken;
let friendToken;

beforeAll(async () => {
    await initDb();

    ({
        exampleUserId,
        exampleFriendId,
        userToken,
        friendToken
    } = await createTestUsers());
});

// beforeEach(async () => {
//     ({ exampleImageId } = await createTestImage(exampleUserId));
// });

// afterEach(async () => {
//     await mongoose.connection.dropCollection('images');
// });

afterAll(async () => {
    await closeDb();
});


describe("Image API endpoints", () => {

    describe("getImage", () => {

        test("should respond with 'invalid id' error", async () => {
            await checkInvalidId('get', '/images/111', userToken);
        });

        test("should respond with 'no such image' error", async () => {
            await checkNotFound('get', `/images/${notExistingId}`, userToken);
        });

    });

    describe("uploadImage", () => {

    });

    describe("deleteImage", () => {

        test("should respond with 'invalid id' error", async () => {
            await checkInvalidId('delete', '/images/111', userToken);
        });

        test("should respond with 'no such image' error", async () => {
            await checkNotFound('delete', `/images/${notExistingId}`, userToken);
        });

    });

    describe("likeImage", () => {

        test("should respond with 'invalid id' error", async () => {
            await checkInvalidId('post', '/images/111/likes', userToken);
        });

        test("should respond with 'no such image' error", async () => {
            await checkNotFound('post', `/images/${notExistingId}/likes`, userToken);
        });

    });

    describe("unlikeImage", () => {
        
        test("should respond with 'invalid id' error", async () => {
            await checkInvalidId('delete', '/images/111/likes', userToken);
        });

        test("should respond with 'no such image' error", async () => {
            await checkNotFound('delete', `/images/${notExistingId}/likes`, userToken);
        });

    });
    
});
