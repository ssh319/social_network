import { Router } from 'express';

import * as controller from '../controllers/imageController.js';

import {
    validateImageId,
    // validateImageAccess
} from '../validators/imageValidators.js';


const router = Router();
// getUser returns arr of Image ObjectIds, how to retrieve user's images then?
// upd: (User.findById(...).populate({ path: 'images' })) ???
// upd2: done in service.getUser

// !!!
// router.get("/:userId/all", validateId, controller.retrieveImages);
router.get("/:imageId", validateImageId, controller.getImage);


export default router;
