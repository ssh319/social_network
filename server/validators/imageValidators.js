import { isValidObjectId } from "mongoose";
import { body, checkExact, validationResult } from "express-validator";


export const validateImageId = (request, response, next) => {
    if (!isValidObjectId(request.params.imageId)) {
        return response.status(400).json({ message: "Invalid image id provided" });
    }

    next();
}


export const validateImage = []
