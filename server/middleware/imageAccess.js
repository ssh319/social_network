import Image from '../models/imageModel.js';


export const checkImageAccess = async (request, response, next) => {
    const image = await Image.findById(request.params.imageId);

    if (!image.user.equals(request.user._id)) {
        return response.status(403).json({ message: "Access to the image denied" });
    }

    next();
}
