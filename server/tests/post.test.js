import request from 'supertest';
import mongoose from 'mongoose';

import app from '../app.js';

import {
    initDb,
    closeDb,
    createTestUsers,
    createTestPost
} from './dbUtils.js';

import Post from '../models/postModel.js';
import User from '../models/userModel.js';


const notExistingId = "00aa11bb22cc33dd44ee55ff";

let exampleUserId;
let exampleFriendId;
let examplePostId;
let exampleCommentId;
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
    exampleCommentId = postCreationResult.exampleCommentId;
});

afterEach(async () => {
    await mongoose.connection.dropCollection('posts');
});

afterAll(async () => {
    await closeDb();
});


describe("Post API endpoints", () => {
    
    describe("getPostsFeed", () => {

        test("should return an array of posts by user or its friends and contain basic creator info", async () => {
            const postByFriend = await Post.create({
                user: exampleFriendId,
                text: "Friend's post example",
            });

            const postByStranger = await Post.create({
                user: notExistingId,
                text: "Stranger's post example"
            });

            const response = await request(app)
                .get('/posts/feed')
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("posts");
            expect(response.body.posts).toBeInstanceOf(Array);

            const examplePost = response.body.posts[0];

            expect(examplePost).toHaveProperty("user.firstName", "User");
            expect(examplePost).toHaveProperty("user.lastName", "Example");
            expect(examplePost).toHaveProperty("user.profilePicture");

            expect(
                response.body.posts.some(
                    post => post._id === examplePostId
                )
            ).toBeTruthy();

            expect(
                response.body.posts.some(
                    post => postByFriend._id.equals(post._id)
                )
            ).toBeTruthy();

            expect(
                response.body.posts.some(
                    post => postByStranger._id.equals(post._id)
                )
            ).toBeFalsy();
        });

        test("should return an empty array due to posts absence", async () => {
            await Post.deleteMany();

            const response = await request(app)
                .get('/posts/feed')
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("posts");
            expect(response.body.posts).toBeInstanceOf(Array);
            expect(response.body.posts).toHaveLength(0);
        });
 
    });


    describe("getPost", () => {
        test("should return post information and its creator's info", async () => {
            const response = await request(app)
                .get(`/posts/${examplePostId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("post");

            expect(response.body.post).toHaveProperty("user._id", exampleUserId);
            expect(response.body.post).toHaveProperty("user.firstName", "User");
            expect(response.body.post).toHaveProperty("user.lastName", "Example");
            expect(response.body.post).toHaveProperty("user.profilePicture");
        });

        test("should respond with 'no such post' error", async () => {
            const response = await request(app)
                .get(`/posts/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .get('/posts/111')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

    });


    describe("createPost", () => {
        test("should create new post with the request sender as its 'user'", async () => {
            const response = await request(app)
                .post('/posts')
                .send({
                    text: "New post test"
                })
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toEqual(201);
            expect(response.body).toHaveProperty("createdPost");
            
            const post = await Post.findById(response.body.createdPost);

            expect(post.user.equals(exampleUserId));
            expect(post.text).toEqual("New post test");
        });

        test("should respond with post data validation errors list", async () => {
            const response = await request(app)
                .post('/posts')
                .send({
                    text: "p".repeat(501)
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("msg");
            expect(response.body.errors[0]).toHaveProperty("path", "text");

            expect(response.body.errors).toHaveLength(1);
        });

        test("should respond with 'unexpected fields' error", async () => {
            const response = await request(app)
                .post('/posts')
                .send({
                    text: "Text",
                    unexpectedField: "value"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("msg");
        });

        test("should respond with 'invalid type' error", async () => {
            const response = await request(app)
                .post('/posts')
                .send({
                    text: 1
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("msg");
            expect(response.body.errors[0]).toHaveProperty("path", "text");
        });

    });


    describe("deletePost", () => {
        test("should delete the post from database", async () => {
            const response = await request(app)
                .delete(`/posts/${examplePostId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(200);
            
            const deletedPost = await Post.findById(examplePostId);

            expect(deletedPost).toBeNull();

            const user = await User.findById(exampleUserId);

            expect(user.posts.some(post => post._id.equals(examplePostId))).toBeFalsy();
        });

        test("should respond with 'no post access' error", async () => {
            const response = await request(app)
                .delete(`/posts/${examplePostId}`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");

            const deletedPost = await Post.findById(examplePostId);

            expect(deletedPost).not.toBeNull();

            const user = await User.findById(exampleUserId);

            expect(user.posts.some(post => post._id.equals(examplePostId))).toBeTruthy();
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .delete('/posts/111')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such post' error", async () => {
            const response = await request(app)
                .delete(`/posts/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

    });


    describe("likePost", () => {
        test("should push user's id to 'likes' array of the post", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const likedPost = await Post.findById(examplePostId);

            expect(likedPost.likes).toHaveLength(1);
            expect(likedPost.likes[0].equals(exampleFriendId)).toBeTruthy();
        });

        test("should do nothing and respond with 'OK' since the post is already liked by user", async () => {
            await Post.findByIdAndUpdate(
                examplePostId,
                { $addToSet: {
                    likes: exampleFriendId
                } }
            );
            
            const response = await request(app)
                .post(`/posts/${examplePostId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const likedPost = await Post.findById(examplePostId);

            expect(likedPost.likes).toHaveLength(1);
            expect(likedPost.likes[0].equals(exampleFriendId)).toBeTruthy();
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .post('/posts/111/likes')
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such post' error", async () => {
            const response = await request(app)
                .post(`/posts/${notExistingId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

    });


    describe("unlikePost", () => {
        test("should pull the user's id from 'likes' array of the post", async () => {
            await Post.findByIdAndUpdate(
                examplePostId,
                { $addToSet: {
                    likes: exampleFriendId
                } }
            );
            
            const response = await request(app)
                .delete(`/posts/${examplePostId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const unlikedPost = await Post.findById(examplePostId);

            expect(unlikedPost.likes).toHaveLength(0);
        });

        test("should do nothing and respond with 'OK' since the post was not liked by user", async () => {
            const response = await request(app)
                .delete(`/posts/${examplePostId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const unlikedPost = await Post.findById(examplePostId);

            expect(unlikedPost.likes).toHaveLength(0);
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .delete('/posts/111/likes')
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such post' error", async () => {
            const response = await request(app)
                .delete(`/posts/${notExistingId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

    });


    describe("sendPostComment", () => {
        test("should push the new comment object to post's 'comments' array", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/comments`)
                .send({
                    text: "Comment test"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(201);

            const commentedPost = await Post.findById(examplePostId);

            expect(commentedPost.comments).toHaveLength(2);

            const sentComment = commentedPost.comments[1];
            
            expect(sentComment).toHaveProperty("user");
            expect(sentComment.user.equals(exampleUserId)).toBeTruthy();
            expect(sentComment).toHaveProperty("text", "Comment test");
            expect(sentComment.timestamp).toBeInstanceOf(Date);
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .post('/posts/111/comments/')
                .send({
                    text: "Post comment test"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such post' error", async () => {
            const response = await request(app)
                .post(`/posts/${notExistingId}/comments/`)
                .send({
                    text: "Post comment test"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with comment data validation errors list", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/comments/`)
                .send({
                    text: "c".repeat(501)
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("msg");
            expect(response.body.errors[0]).toHaveProperty("path", "text");

            expect(response.body.errors).toHaveLength(1);
        });

        test("should respond with 'unexpected fields' error", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/comments/`)
                .send({
                    text: "Post comment test",
                    unexpectedField: "value"
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("msg");
        });

        test("should respond with 'invalid type' error", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/comments/`)
                .send({
                    text: 1
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("errors");

            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0]).toHaveProperty("msg");
            expect(response.body.errors[0]).toHaveProperty("path", "text");
        });

    });


    describe("deletePostComment", () => {
        test("should delete the provided comment from post document", async () => {
            const response = await request(app)
                .delete(`/posts/${examplePostId}/comments/${exampleCommentId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toEqual(200);

            const postAfterCommentDelete = await Post.findById(examplePostId);

            expect(postAfterCommentDelete.comments.id(exampleCommentId)).toBeNull();
        });

        test("should respond with 'no access to comment' error", async () => {
            const response = await request(app)
                .delete(`/posts/${examplePostId}/comments/${exampleCommentId}`)
                .set('Authorization', `Bearer ${friendToken}`);
            
            expect(response.status).toEqual(403);
            expect(response.body).toHaveProperty("message");

            const postAfterCommentDelete = await Post.findById(examplePostId);

            expect(postAfterCommentDelete.comments.id(exampleCommentId)).not.toBeNull();
        });

        test("should respond with 'invalid id' error", async () => {
            const invalidPostIdResponse = await request(app)
                .delete(`/posts/111/comments/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(invalidPostIdResponse.status).toEqual(400);
            expect(invalidPostIdResponse.body).toHaveProperty("message");

            const invalidCommentIdResponse = await request(app)
                .delete(`/posts/${examplePostId}/comments/111`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(invalidCommentIdResponse.status).toEqual(400);
            expect(invalidCommentIdResponse.body).toHaveProperty("message");
        });

        test("should respond with 'no such post' error", async () => {
            const response = await request(app)
                .delete(`/posts/${notExistingId}/comments/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such comment' error", async () => {
            const response = await request(app)
                .delete(`/posts/${examplePostId}/comments/${notExistingId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

    });


    describe("likePostComment", () => {
        test("should add user's id to a post's 'likes' array", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/comments/${exampleCommentId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);
            
            const postWithCommentLiked = await Post.findById(examplePostId);

            expect(postWithCommentLiked.comments.id(exampleCommentId).likes).toHaveLength(1);
            
            expect(
                postWithCommentLiked.comments.id(exampleCommentId).likes[0].equals(exampleFriendId)
            ).toBeTruthy();
        });

        test("should do nothing and respond with 'OK' since the comment is already liked by user", async () => {
            const post = await Post.findById(examplePostId);
            const comment = post.comments.id(exampleCommentId);
            comment.likes.push(exampleFriendId);
            await post.save();

            const response = await request(app)
                .post(`/posts/${examplePostId}/comments/${exampleCommentId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);
            
            const postWithCommentLiked = await Post.findById(examplePostId);

            expect(postWithCommentLiked.comments.id(exampleCommentId).likes).toHaveLength(1);

            expect(
                postWithCommentLiked.comments.id(exampleCommentId).likes[0].equals(exampleFriendId)
            ).toBeTruthy();
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/comments/111/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such post' error", async () => {
            const response = await request(app)
                .post(`/posts/${notExistingId}/comments/${notExistingId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such comment' error", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/comments/${notExistingId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });
        
    });
    

    describe("unlikePostComment", () => {
        test("should remove user's id from post's 'likes' array", async () => {
            const post = await Post.findById(examplePostId);
            const comment = post.comments.id(exampleCommentId);
            comment.likes.push(exampleFriendId);
            await post.save();

            const response = await request(app)
                .delete(`/posts/${examplePostId}/comments/${exampleCommentId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);

            const postWithCommentUnliked = await Post.findById(examplePostId);

            expect(postWithCommentUnliked.comments.id(exampleCommentId).likes).toHaveLength(0);
        });

        test("should do nothing and respond with 'OK' since the comment was not liked by user", async () => {
            const response = await request(app)
                .delete(`/posts/${examplePostId}/comments/${exampleCommentId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(200);
        });

        test("should respond with 'invalid id' error", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/comments/111/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such post' error", async () => {
            const response = await request(app)
                .post(`/posts/${notExistingId}/comments/${notExistingId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

        test("should respond with 'no such comment' error", async () => {
            const response = await request(app)
                .post(`/posts/${examplePostId}/comments/${notExistingId}/likes`)
                .set('Authorization', `Bearer ${friendToken}`);

            expect(response.status).toEqual(404);
            expect(response.body).toHaveProperty("message");
        });

    });

});
