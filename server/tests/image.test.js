import request from 'supertest';
import mongoose from 'mongoose';
import fs from 'fs/promises';

import Image from '../models/imageModel.js';

import {
    app,
    initDb,
    closeDb,
    createTestUsers,
    createTestImage,
    checkInvalidId,
    checkNotFound
} from './utils.js';
import User from '../models/userModel.js';


const BASE_URL = '/api/images';
const notExistingId = "00aa11bb22cc33dd44ee55ff";

let exampleUserId;
let exampleFriendId;
let exampleJpegImageId;
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

beforeEach(async () => {
    ({ exampleJpegImageId } = await createTestImage(exampleUserId));
});

afterEach(async () => {
    await mongoose.connection.dropCollection('images');

    await User.findByIdAndUpdate(exampleUserId, { $set: { images: [] } })
});

afterAll(async () => {
    await closeDb();
});


describe("Image API endpoints", () => {

    describe("getImage", () => {
        test("should return all of the image data", async () => {
            const response = await request(app)
                .get(`${BASE_URL}/${exampleJpegImageId}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("image");

            expect(response.body.image).toHaveProperty("_id", exampleJpegImageId);
            expect(response.body.image).toHaveProperty("path");
            expect(response.body.image.path.endsWith('jpegExampleImage.jpeg')).toBeTruthy();
            expect(response.body.image).toHaveProperty("mimeType", "image/jpeg");
            expect(response.body.image).toHaveProperty("size", 10000);

            expect(response.body.image).toHaveProperty("user.firstName", "User");
            expect(response.body.image).toHaveProperty("user.lastName", "Example");
            expect(response.body.image).toHaveProperty("user.profilePicture");
        });

        test("should respond with 'invalid id' error", async () => {
            await checkInvalidId('get', `${BASE_URL}/111`, userToken);
        });

        test("should respond with 'no such image' error", async () => {
            await checkNotFound('get', `${BASE_URL}/${notExistingId}`, userToken);
        });

    });

    describe("uploadImage", () => {
        test("should create new image document", async () => {
            const response = await request(app)
                .post(BASE_URL)
                .attach('image', Buffer.from('test image content'), 'jpegExampleImage.jpg')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toEqual(201);

            expect(response.body).toHaveProperty("_id");
            expect(response.body).toHaveProperty("mimeType", "image/jpeg");
            expect(response.body).toHaveProperty("user", exampleUserId);
            expect(response.body).toHaveProperty("path");

            expect(response.body.path.startsWith('uploads/')).toBeTruthy();
            expect(response.body.path.endsWith('.jpg')).toBeTruthy();

            const user = await User.findById(exampleUserId);

            expect(user.images).toHaveLength(2);

            await fs.unlink(response.body.path).catch(err => {
                if (err.code !== 'ENOENT') throw err;
            });
        });

        test("should respond with 'image required' error", async () => {
            const response = await request(app)
                .post(BASE_URL)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            const user = await User.findById(exampleUserId);

            expect(user.images).toHaveLength(1);
        });

        test("should respond with 'unauthorized' error", async () => {
            const response = await request(app)
                .post(BASE_URL)
                .attach('image', Buffer.from('test image content'), 'jpegExampleImage.jpg');
            
            expect(response.status).toEqual(401);
            expect(response.body).toHaveProperty("errors");
        });
    });

    describe("deleteImage", () => {
        test("should delete the image from database", async () => {
            const response = await request(app)
                .delete(`${BASE_URL}/${exampleJpegImageId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toEqual(200);
            
            const deletedImage = await Image.findById(exampleJpegImageId);
            expect(deletedImage).toBeNull();

            const user = await User.findById(exampleUserId);
            expect(user.images.some(img => img._id.equals(exampleJpegImageId))).toBeFalsy();
        });

        test("should respond with 'no image access' error", async () => {
            const response = await request(app)
                .delete(`${BASE_URL}/${exampleJpegImageId}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("errors");

            const image = await Image.findById(exampleJpegImageId);
            expect(image).not.toBeNull();

            const user = await User.findById(exampleUserId);
            expect(user.images.some(img => img._id.equals(exampleJpegImageId))).toBeTruthy();
        });

        test("should respond with 'invalid id' error", async () => {
            await checkInvalidId('delete', `${BASE_URL}/111`, userToken);
        });

        test("should respond with 'no such image' error", async () => {
            await checkNotFound('delete', `${BASE_URL}/${notExistingId}`, userToken);
        });

    });

    describe("likeImage", () => {
        test("should push user's id to likes array of the image", async () => {
            const response = await request(app)
                .post(`${BASE_URL}/${exampleJpegImageId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);
            
            const likedImage = await Image.findById(exampleJpegImageId);
            expect(likedImage.likes.some(like => like.equals(exampleFriendId))).toBeTruthy();
        });

        test("should do nothing and respond with 'OK' since the image is already liked by user", async () => {
            await Image.findByIdAndUpdate(
                exampleJpegImageId,
                { $addToSet: {
                    likes: exampleFriendId
                } }
            );
            
            const response = await request(app)
                .post(`${BASE_URL}/${exampleJpegImageId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const likedImage = await Image.findById(exampleJpegImageId);

            expect(likedImage.likes).toHaveLength(1);
            expect(likedImage.likes[0].equals(exampleFriendId)).toBeTruthy();
        });

        test("should respond with 'invalid id' error", async () => {
            await checkInvalidId('post', `${BASE_URL}/111/likes`, userToken);
        });

        test("should respond with 'no such image' error", async () => {
            await checkNotFound('post', `${BASE_URL}/${notExistingId}/likes`, userToken);
        });

    });

    describe("unlikeImage", () => {
        test("should pull the user's id from 'likes' array of the image", async () => {
            await Image.findByIdAndUpdate(
                exampleJpegImageId,
                { $addToSet: {
                    likes: exampleFriendId
                } }
            );

            const response = await request(app)
                .delete(`${BASE_URL}/${exampleJpegImageId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const unlikedImage = await Image.findById(exampleJpegImageId);
            expect(unlikedImage.likes).toHaveLength(0);
        });

        test("should do nothing and respond with 'OK' since the image was not liked by user", async () => {
            const response = await request(app)
                .delete(`${BASE_URL}/${exampleJpegImageId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const unlikedImage = await Image.findById(exampleJpegImageId);
            expect(unlikedImage.likes).toHaveLength(0);
        });
        
        test("should respond with 'invalid id' error", async () => {
            await checkInvalidId('delete', `${BASE_URL}/111/likes`, userToken);
        });

        test("should respond with 'no such image' error", async () => {
            await checkNotFound('delete', `${BASE_URL}/${notExistingId}/likes`, userToken);
        });

    });
    
});
