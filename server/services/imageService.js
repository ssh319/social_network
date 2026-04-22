import Image from '../models/imageModel.js';
import User from '../models/userModel.js';

import { NoSuchImageError } from '../errors/imageErrors.js';


/**
 * Retrieve the image data including its author's name.
 * 
 * @param {String} imageId `ObjectId` of the image.
 * @returns {Promise<Object>} Retrieved image data.
 */
export const getImage = async (imageId) => {
    const image = await Image.findById(imageId).populate({
        path: 'user',
        select: ['firstName', 'lastName', 'profilePicture']
    });

    if (!image) {
        throw new NoSuchImageError("Such image doesn't exist", "imageId");
    }

    return image;
}


/**
 * Upload new image.
 * 
 * @param {String} userId `ObjectId` of image author.
 * @param {Object} image Image data, containing its storage path and MIME content type.
 */
export const uploadImage = async (userId, image) => {
    const newImage = await Image.create({
        user: userId,
        path: image.path,
        mimeType: image.mimetype,
        size: image.size
    });

    await User.findByIdAndUpdate(userId, {
        $push: { images: newImage._id }
    });

    return newImage;
}


/**
 * Delete image and clear all of its resources.
 * 
 * @param {String} imageId `ObjectId` of the image to be deleted.
 */
export const deleteImage = async (imageId) => {
    // !!!
    // The image existence has been checked in imageAccess.js
}


/**
 * Give a like to an image as the provided user. Do nothing if it's already given.
 * 
 * @param {String} userId `ObjectId` of a user, whose like will be on the image.
 * @param {String} imageId `ObjectId` of an image to be liked.
 */
export const likeImage = async (userId, imageId) => {
    const image = await Image.findByIdAndUpdate(imageId, {
        $addToSet: { likes: userId }
    });

    if (!image) {
        throw new NoSuchImageError("No such image to like", "imageId");
    }
}


/**
 * Remove the user's like from an image if it is. Do nothing if not.
 * 
 * @param {String} userId `ObjectId` of a user, whose like will be removed from the image.
 * @param {String} imageId `ObjectId` of an image to remove the like from.
 */
export const unlikeImage = async (userId, imageId) => {
    const image = await Image.findByIdAndUpdate(imageId, {
        $pull: { likes: userId }
    });

    if (!image) {
        throw new NoSuchImageError("No such image to remove a like from", "imageId");
    }
}
