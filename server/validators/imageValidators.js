import { isValidObjectId } from "mongoose";


export const validateImageId = (request, response, next) => {
    if (!isValidObjectId(request.params.imageId)) {
        return response.status(400).json({ message: "Invalid image id provided" });
    }

    next();
}


// export const validateImageAccess = (request, response, next) => {}


// export const validateImage = []
