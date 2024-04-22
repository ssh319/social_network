import Post from '../models/postModel.js';

import { NoSuchResourceError } from '../errors/postErrors.js';


/**
 * Retrieve feed, containing posts by user's friends.
 * 
 * @param {String} userId ObjectId of the user, whose feed to retrieve.
 * @returns {Promise<Array>} List of post objects.
 */
export const getPostsFeed = async (userId) => {}


/**
 * Get public post info by its id.
 * 
 * @param {String} postId ObjectId of the post.
 * @returns {Promise<Object>} Object, containing the full post info.
 */
export const getPost = async (postId) => {}


/**
 * Create a public post.
 * 
 * @param {String} userId ObjectId of the post creator.
 * @param {Object} post Post data, which may include references to images, if the post is required to contain any.
 */
export const createPost = async (userId, post) => {}


/**
 * Delete a public post.
 * 
 * @param {String} postId ObjectId of a post for deletion.
 */
export const deletePost = async (postId) => {}


/**
 * Give a like to the post as the provided user. Do nothing if it's already given.
 * 
 * @param {String} userId ObjectId of a user, whose like will be on the post.
 * @param {String} postId ObjectId of a post to be liked.
 */
export const likePost = async (userId, postId) => {}


/**
 * Remove the user's like from a post if it is, do nothing if not.
 * 
 * @param {String} userId ObjectId of a user, whose like will be removed from the post.
 * @param {String} postId ObjectId of a post to remove the like from.
 */
export const unlikePost = async (userId, postId) => {}


/**
 * Send comment to a post as the provided user.
 * 
 * @param {String} userId ObjectId of a user, which the comment will be sent by.
 * @param {String} postId ObjectId of a post to comment.
 * @param {Object} comment Comment data.
 */
export const sendPostComment = async (userId, postId, comment) => {}


/**
 * Update the provided comment's text.
 * 
 * @param {String} postId ObjectId of a post, whose comment will be edited.
 * @param {String} commentId ObjectId of a comment to edit.
 * @param {String} commentText New comment text.
 */
export const editPostComment = async (postId, commentId, commentText) => {}


/**
 * Delete provided comment from a post.
 * 
 * @param {String} postId ObjectId of a post, whose comment will be deleted.
 * @param {String} commentId ObjectId of a comment to delete.
 */
export const deletePostComment = async (postId, commentId) => {}
