import { Router } from 'express';

import * as controller from '../controllers/imageController.js';

import { validateImage, validateImageId } from '../validators/imageValidators.js';
import { checkImageAccess } from '../middleware/imageAccess.js';


const router = Router();

router.post("/", validateImage, controller.uploadImage);

router.get("/:imageId", validateImageId, controller.getImage);
router.delete("/:imageId", validateImageId, checkImageAccess, controller.deleteImage);

router.post("/:imageId/like", validateImageId, controller.likeImage);
router.delete("/:imageId/like", validateImageId, controller.unlikeImage);


export default router;
