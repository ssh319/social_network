import { isValidObjectId } from "mongoose";
import { body, checkExact, validationResult } from "express-validator";


export const validateImageId = (request, response, next) => {
    if (!isValidObjectId(request.params.imageId)) {
        return response.status(400).json({ message: "Invalid image id provided" });
    }

    next();
}


export const validateImage = [
    // body("...")
    //    .exists().withMessage("...").bail(),

    // checkExact(),

    (request, response, next) => {
        const validationErrors = validationResult(request);

        if (!validationErrors.isEmpty()) {
            return response.status(400).json({
                errors: validationErrors.errors.map(error => error.msg)
            });
        }

        next();
    }
]
