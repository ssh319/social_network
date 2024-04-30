import { Router } from 'express';

import * as controller from '../controllers/userController.js';

import authenticate from '../middleware/authenticate.js';

import {
    validateUserId,
    validateUserData,
    validateUserLogin
    // validateSearchQuery
} from '../validators/userValidators.js';


const router = Router();


router.get("/", authenticate, /* validateSearchQuery, */ controller.searchUsers);
router.get("/:userId", authenticate, validateUserId, controller.getUser);

router.post("/signup", validateUserData, controller.createUser);
router.post("/login", validateUserLogin, controller.authenticateUser);

router.patch("/account", authenticate, validateUserData, controller.updateUser);
router.delete("/account", authenticate, controller.deleteUser);

router.patch("/update_online", authenticate, controller.updateOnline);

router.post("/friends/:userId", authenticate, validateUserId, controller.addFriend);
router.patch("/friends/:userId", authenticate, validateUserId, controller.acceptFriend);
router.delete("/friends/:userId", authenticate, validateUserId, controller.removeFriend);


export default router;
