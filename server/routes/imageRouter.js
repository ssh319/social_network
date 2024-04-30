import { Router } from 'express';

import * as controller from '../controllers/imageController.js';

import { validateImage, validateImageId } from '../validators/imageValidators.js';
import { checkImageAccess } from '../middleware/imageAccess.js';

// import processImage from '../middleware/imageProcessing.js';


const router = Router();

router.get("/:imageId", validateImageId, controller.getImage);

router.post("/", validateImage, controller.uploadImage);
router.delete("/:imageId", validateImageId, checkImageAccess, controller.deleteImage);

router.post("/:imageId/likes", validateImageId, controller.likeImage);
router.delete("/:imageId/likes", validateImageId, controller.unlikeImage);


export default router;
