import { isValidObjectId } from "mongoose"


export const validatePostId = (request, response, next) => {
    if (!isValidObjectId(request.params.postId)) {
        return response.status(400).json({ message: "Invalid post id provided" });
    }

    next();
}


// export const validatePostAccess = (request, response, next) => {}


// export const validatePost = []
