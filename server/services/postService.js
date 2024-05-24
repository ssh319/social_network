import mongoose from 'mongoose';

import Post from '../models/postModel.js';
import User from '../models/userModel.js';

import { NoSuchPostError, NoSuchCommentError } from '../errors/postErrors.js';


/**
 * Retrieve feed, containing posts from user's friends.
 * 
 * @param {String} userId `ObjectId` of the user, whose feed to retrieve.
 * @returns {Promise<Array>} List of post objects.
 */
export const getPostsFeed = async (userId) => {
    const user = await User.findById(userId, { friends: 1 });

    user.friends = user.friends.filter(friend => friend.status === 'friend');
    
    const feed = await Post.find({
        user: {
            $in: [
                user._id,
                ...user.friends.map(friend => friend.user)
            ]
        }
    }).populate({
        path: 'user',
        select: ['firstName', 'lastName', 'profilePicture']
    });

    return feed;
}


/**
 * Get public post info by its id.
 * 
 * @param {String} postId `ObjectId` of the post.
 * @returns {Promise<Object>} Object containing the full post info.
 */
export const getPost = async (postId) => {
    const post = await Post.findById(
        postId
    ).populate({
        path: 'user',
        select: ['firstName', 'lastName', 'profilePicture']
    }).populate({
        path: 'comments.user',
        select: ['firstName', 'lastName', 'profilePicture']
    }).populate({
        path: 'likes',
        select: ['firstName', 'lastName', 'profilePicture']
    });

    if (!post) {
        throw new NoSuchPostError("Such post doesn't exist");
    }

    return post;
}


/**
 * Create a public post.
 * 
 * @param {String} userId `ObjectId` of the post creator.
 * @param {Object} post Post data, which may include references to images, if the post is required to contain any.
 */
export const createPost = async (userId, post) => {

    post.user = userId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [ createdPost ] = await Post.insertMany(post, { session });

        await User.findByIdAndUpdate(userId, {
            $push: { posts: createdPost._id }
        }, { session });

        await session.commitTransaction();

        return createdPost;

    } finally {
        await session.endSession();
    }
}


/**
 * Delete a public post.
 * 
 * @param {String} postId `ObjectId` of a post to be deleted.
 */
export const deletePost = async (postId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const post = await Post.findByIdAndDelete(postId, { session });

        await User.findByIdAndUpdate(post.user, {
            $pull: { posts: post._id }
        }, { session });

        await session.commitTransaction();

    } finally {
        await session.endSession();
    }
}


/**
 * Give a like to the post as the provided user. Do nothing if it's already given.
 * 
 * @param {String} userId `ObjectId` of a user, whose like will be on the post.
 * @param {String} postId `ObjectId` of the post to be liked.
 */
export const likePost = async (userId, postId) => {
    const post = await Post.findByIdAndUpdate(postId, {
        $addToSet: { likes: userId }
    });

    if (!post) {
        throw new NoSuchPostError("No such public post to like");
    }
}


/**
 * Remove the user's like from a post if it is, do nothing if not.
 * 
 * @param {String} userId `ObjectId` of a user, whose like will be removed from the post.
 * @param {String} postId `ObjectId` of the post to remove the like from.
 */
export const unlikePost = async (userId, postId) => {
    const post = await Post.findByIdAndUpdate(postId, {
        $pull: { likes: userId }
    });

    if (!post) {
        throw new NoSuchPostError("No such public post to remove a like from");
    }
}


/**
 * Send comment to a post as the provided user.
 * 
 * @param {String} userId `ObjectId` of a user, which the comment will be sent by.
 * @param {String} postId `ObjectId` of the post to comment.
 * @param {Object} comment Comment data.
 */
export const sendPostComment = async (userId, postId, comment) => {

    comment.user = userId;

    const post = await Post.findByIdAndUpdate(postId, {
        $push: { comments: comment }
    });

    if (!post) {
        throw new NoSuchPostError("No such public post to comment");
    }
}


/**
 * Delete provided comment from a post.
 * 
 * @param {String} postId `ObjectId` of a post, whose comment will be deleted.
 * @param {String} commentId `ObjectId` of the comment to delete.
 */
export const deletePostComment = async (postId, commentId) => {
    await Post.findByIdAndUpdate(postId, {
        $pull: { comments: { _id: commentId } }
    });
}


/**
 * Give a like to the post comment as the provided user.
 * 
 * @param {String} userId `ObjectId` of a user, whose like will be on the comment.
 * @param {String} postId `ObjectId` of a post, whose comment to like.
 * @param {String} commentId `ObjectId` of the comment to give a like to.
 */
export const likePostComment = async (userId, postId, commentId) => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new NoSuchPostError("Provided post doesn't exist");
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
        throw new NoSuchCommentError("No such post comment to like");
    }

    if (!comment.likes.includes(userId)) {
        comment.likes.push(userId);
    }

    await post.save();
}


/**
 * Remove the provided user's like from the post comment if it is.
 * 
 * @param {String} userId `ObjectId` of a user, whose like will be removed from comment.
 * @param {String} postId `ObjectId` of a post, whose comment a like will be removed from.
 * @param {String} commentId `ObjectId` of the comment to remove a like from.
 */
export const unlikePostComment = async (userId, postId, commentId) => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new NoSuchPostError("Provided post doesn't exist");
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
        throw new NoSuchCommentError("No such post comment to like");
    }

    comment.likes = comment.likes.filter(
        like => !like.equals(userId)
    );

    await post.save();
}
