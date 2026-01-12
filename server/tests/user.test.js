import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';
import User from '../models/userModel.js';

import {
    initDb,
    closeDb,
    createTestUsers,
    checkInvalidId,
    checkNotFound
} from './utils.js';


const notExistingId = "00aa11bb22cc33dd44ee55ff";

let exampleUserId;
let exampleFriendId;
let userToken;

beforeAll(async () => {
    await initDb();
});

beforeEach(async () => {
    ({
        exampleUserId,
        exampleFriendId,
        userToken
    } = await createTestUsers());
});

afterEach(async () => {
    await mongoose.connection.dropCollection('users');
});

afterAll(async () => {
    await closeDb();
});


// 2500 ms!
test("should respond with 'bad request' to a syntax-malformed json request body", async () => {
    const response = await request(app)
        .post('/users/signup')
        .send('{ "email": "syntaxerror@testmail.com",,, }')
        .set('Content-Type', 'application/json');

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty("errors");
});


describe("User API endpoints", () => {

    // Unauthorized requests testing
    test("should respond with 'unauthorized' error due to 'Authorization' header absence", async () => {
        const response = await request(app)
            .get('/users?firstName=unauthorizedTest');
            
        expect(response.status).toEqual(401);
        expect(response.body).toHaveProperty("errors");
    });
        
    test("should respond with 'unauthorized' error due to invalid Bearer token", async () => {
        const response = await request(app)
            .get('/users?firstName=unauthorizedTest')
            .set('Authorization', 'Bearer invalidtoken');
        
        expect(response.status).toEqual(401);
        expect(response.body).toHaveProperty("errors");
    });

    // Routes testing
    describe("searchUsers", () => {
        
        test("should return an array of matching users", async () => {
            // const response = await request(app)
            //     .get('/users?lastName=Example')
            // 
            //     .set('Authorization', `Bearer ${userToken}`);
        
            // expect(response.status).toEqual(200);
            // expect(response.body).toHaveProperty("users");
            // expect(response.body.users).toBeInstanceOf(Array);
            // expect(response.body.users).toHaveLength(2);
            // expect(response.body.users[0].lastName).toEqual("Example");
        });

    });


    describe("getUser", () => {

        test("should return only the public user data in 'user' object", async () => {
            const response = await request(app)
                .get(`/users/${exampleUserId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("user");
            expect(response.body.user.firstName).toEqual("User");
            expect(response.body.user).not.toHaveProperty("email");
            expect(response.body.user).not.toHaveProperty("password");
            expect(response.body.user._id).toEqual(exampleUserId);
        });

        test("should respond with 'invalid id' error", async () => {
            await checkInvalidId('get', '/users/111', userToken);
        });

        test("should respond with 'no such user' error", async () => {
            await checkNotFound('get', `/users/${notExistingId}`, userToken);
        });

    });


    describe("createUser", () => {

        test("should sanitize and create new user, then return its generated id & first and last name", async () => {
            const response = await request(app)
                .post('/users/signup')
                .send({
                    email: "newuser@testmail.com",
                    password: "11112222",
                    firstName: "new",
                    lastName: "USER"
                });

            expect(response.status).toEqual(201);
            expect(response.body).toHaveProperty("createdUser");
            
            const createdUser = await User.findById(response.body.createdUser._id);

            expect(createdUser.firstName).toEqual("New");
            expect(createdUser.lastName).toEqual("User");
            expect(createdUser.password.startsWith("$2b")).toBeTruthy();
        });

        test("should respond with user data validation errors list", async () => {
            const response = await request(app)
                .post('/users/signup')
                .send({
                    email: "invalid mail",
                    password: "invalid password",
                    firstName: "invalid name",
                    lastName: "123"
                });

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
            
            expect(Object.keys(response.body.errors)).toHaveLength(4);
        });

        test("should respond with 'unexpected fields' error", async () => {
            const response = await request(app)
                .post('/users/signup')
                .send({
                    email: "newuser@testmail.com",
                    password: "11112222",
                    firstName: "New",
                    lastName: "User",
                    unexpectedField: "value"
                });

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
            
            expect(Object.keys(response.body.errors)).toHaveLength(1);
        });

        test("should respond with 'invalid type' error", async () => {
            const response = await request(app)
                .post('/users/signup')
                .send({
                    email: 1,
                    password: "11112222",
                    firstName: "New",
                    lastName: "User"
                });

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
        });

        test("should respond with 'already exists' error", async () => {
            const response = await request(app)
                .post('/users/signup')
                .send({
                    email: "example@testmail.com",
                    password: "11112222",
                    firstName: "AlreadyUsed",
                    lastName: "Email"
                });

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors")
            
            expect(Object.keys(response.body.errors)).toHaveLength(1);
        });
        
    });

    
    describe("authenticateUser", () => {

        test("should return an object with token string", async () => {
            const response = await request(app)
                .post('/users/login')
                .send({
                    email: "example@testmail.com",
                    password: "12345678"
                });

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("token");
        });

        test("should respond with 'no such user' error", async () => {
            const response = await request(app)
                .post('/users/login')
                .send({
                    email: "notexistinguser@testmail.com",
                    password: "12345678"
                });

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("errors");
        });

        test("should respond with 'incorrect password' error", async () => {
            const response = await request(app)
                .post('/users/login')
                .send({
                    email: "example@testmail.com",
                    password: "wrongpassword"
                });

            expect(response.status).toEqual(401);
            expect(response.body).toHaveProperty("errors");
        });

        test("should respond with 'unexpected fields' error", async () => {
            const response = await request(app)
                .post('/users/login')
                .send({
                    email: "example@testmail.com",
                    password: "12345678",
                    unexpectedField: "value"
                })


            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(Object.keys(response.body.errors)).toHaveLength(1);
        });

        test("should respond with 'invalid type' error", async () => {
            const response = await request(app)
                .post('/users/login')
                .send({
                    email: 1,
                    password: "12345678"
                });

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(Object.keys(response.body.errors)).toHaveLength(1);
        });

    });


    describe("updateUser", () => {

        test("should have updated the according user data", async () => {

            const userBeforeUpdate = await User.findById(exampleUserId);

            const response = await request(app)
                .patch('/users/account')
                .send({
                    email: "updatedmail@testmail.com",
                    oldPassword: "12345678",
                    password: "newpassword"
                })
                .set('Authorization', `Bearer ${userToken}`);
                
            expect(response.status).toEqual(200);

            const userAfterUpdate = await User.findById(userBeforeUpdate._id);

            expect(userAfterUpdate.email).toEqual("updatedmail@testmail.com");
            expect(userAfterUpdate.password).not.toEqual(userBeforeUpdate.password);
            expect(userAfterUpdate.password.startsWith("$2b")).toBeTruthy();
        });

        test("should respond with user data validation errors list", async () => {
            const response = await request(app)
                .patch('/users/account')
                .send({
                    firstName: "Invalid name 123"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
            
            expect(Object.keys(response.body.errors)).toHaveLength(1);
        });

        test("should respond with 'unexpected fields' error", async () => {
            const response = await request(app)
                .patch('/users/account')
                .send({
                    email: "newuser@testmail.com",
                    oldPassword: "12345678",
                    password: "11112222",
                    firstName: "New",
                    lastName: "User",
                    unexpectedField: "value"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
            
            expect(Object.keys(response.body.errors)).toHaveLength(1);
        });

        test("should respond with 'invalid type' error", async () => {
            const response = await request(app)
                .patch('/users/account')
                .send({
                    email: 1,
                    oldPassword: "12345678",
                    password: "11112222",
                    firstName: "New",
                    lastName: "User"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
            
            expect(Object.keys(response.body.errors)).toHaveLength(1);
        });

        test("should respond with 'old password required' error", async () => {
            const response = await request(app)
                .patch('/users/account')
                .send({
                    password: "newpassword"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
            
            expect(Object.keys(response.body.errors)).toHaveLength(1);
        });

        test("should respond with 'incorrect old password' error", async () => {
            const response = await request(app)
                .patch('/users/account')
                .send({
                    oldPassword: 'wrongpassword',
                    password: 'newpassword'
                })
                .set('Authorization', `Bearer ${userToken}`);
    
            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("errors");
        });

    });


    describe("deleteUser", () => {

        test("should delete the user and all of its resources from db", async () => {
            const response = await request(app)
                .delete('/users/account')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);

            const deletedUser = await User.findById(exampleUserId);
            // const deletedPost = await Post.findById(examplePostId);
            // const deletedChat = await Chat.findById(exampleChatId);
            // const deletedImage = await Image.findById(exampleImageId);
            
            expect(deletedUser).toBeNull();
            // expect(deletedPost).toBeNull();
            // expect(deletedChat).toBeNull();
            // expect(deletedImage).toBeNull();
        });

    });


    describe("updateOnline", () => {

        test("should set lastActive value to a new date", async () => {
            const beforeUpdateUser = await User.findById(exampleUserId);

            const response = await request(app)
                .patch('/users/update_online')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);

            const afterUpdateUser = await User.findById(exampleUserId);

            expect(afterUpdateUser.lastActive).toBeInstanceOf(Date);
            expect(afterUpdateUser.lastActive > beforeUpdateUser.lastActive).toBeTruthy();
        });

    });


    describe("addFriend", () => {

        test("should add users' ids to each other's 'friends' array", async () => {
            const userToReceiveRequest = await User.create({
                email: "requestreceiver@testmail.com",
                password: "12345678",
                firstName: "Request",
                lastName: "Receiver"
            });

            const response = await request(app)
                .post(`/users/friends/${userToReceiveRequest._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(201);

            const user = await User.findById(exampleUserId);
            const requestReceiver = await User.findById(userToReceiveRequest._id);

            expect(
                user.friends.some(
                    friend => friend.user.equals(requestReceiver._id) && friend.status === 'sent'
                )
            ).toBeTruthy();

            expect(
                requestReceiver.friends.some(
                    friend => friend.user.equals(exampleUserId) && friend.status === 'received'
                )
            ).toBeTruthy();
            
        });

        test("should respond with 'already in friends list' error", async () => {
            const response = await request(app)
                .post(`/users/friends/${exampleFriendId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");
        });

        test("should respond with 'no such user' error", async () => {
            await checkNotFound('post', `/users/friends/${notExistingId}`, userToken);
        });

        test("should respond with 'invalid user id' error", async () => {
            await checkInvalidId('post', '/users/friends/111', userToken);
        })

    });


    describe("acceptFriend", () => {

        test("should update friends' statuses from 'sent' & 'received' to 'friend'", async () => {
            const userToSendRequest = await User.create({
                email: "requestsender@testmail.com",
                password: "12345678",
                firstName: "Request",
                lastName: "Sender",
                friends: [{ user: exampleUserId, status: 'sent' }]
            });

            await User.findByIdAndUpdate(
                exampleUserId,
                { $push: { friends: { user: userToSendRequest._id, status: 'received' } } }
            );

            const response = await request(app)
                .patch(`/users/friends/${userToSendRequest._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);

            const user = await User.findById(exampleUserId);
            const requestSender = await User.findById(userToSendRequest._id);

            expect(
                user.friends.some(
                    friend => friend.user.equals(requestSender._id) && friend.status === 'friend'
                )
            ).toBeTruthy();
            
            expect(
                requestSender.friends.some(
                    friend => friend.user.equals(exampleUserId) && friend.status === 'friend'
                )
            ).toBeTruthy();
        });

        test("should respond with 'no such request' error", async () => {
            await checkNotFound('patch', `/users/friends/${notExistingId}`, userToken);
        });

        test("should respond with 'no such request' error for the user who is already a friend", async () => {
            await checkNotFound('patch', `/users/friends/${exampleFriendId}`, userToken);
        });

        test("should respond with 'invalid user id' errors", async () => {
            await checkInvalidId('patch', '/users/friends/111', userToken);
        });

    });

    
    describe("removeFriend", () => {

        test("should delete users from each other's friends lists", async () => {
            const response = await request(app)
                .delete(`/users/friends/${exampleFriendId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);

            const user = await User.findById(exampleUserId);
            const friend = await User.findById(exampleFriendId);

            expect(
                user.friends.some(
                    friend => friend.user.equals(exampleFriendId)
                )
            ).toBeFalsy();

            expect(
                friend.friends.some(
                    friend => friend.user.equals(exampleUserId)
                )
            ).toBeFalsy();
        });

        test("should respond with 'no such friend' error", async () => {
            await checkNotFound('delete', `/users/friends/${notExistingId}`, userToken);
        });

        test("should respond with 'invalid user id' error", async () => {
            await checkInvalidId('delete', '/users/friends/111', userToken);
        });

    });

});
