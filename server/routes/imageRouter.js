import { Router } from 'express';

import * as controller from '../controllers/imageController.js';

import { validateImage, validateImageId } from '../validators/imageValidators.js';
import { checkImageAccess } from '../middleware/imageAccess.js';
import requireImage from '../middleware/requireImage.js';
import uploadResource from '../middleware/uploadResource.js';


const router = Router();

router.param('imageId', validateImageId);

router.get("/:imageId", controller.getImage);

router.post("/", uploadResource.single('image'), requireImage, validateImage, controller.uploadImage);
router.delete("/:imageId", checkImageAccess, controller.deleteImage);

router.post("/:imageId/likes", controller.likeImage);
router.delete("/:imageId/likes", controller.unlikeImage);


export default router;
