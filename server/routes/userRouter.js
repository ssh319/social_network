import { Router } from 'express';

import * as controller from '../controllers/userController.js';

import authenticate from '../middleware/authenticate.js';

import {
    validateUserId,
    validateUserData,
    validateUserAuth,
    validateSearchQuery
} from '../validators/userValidators.js';


const router = Router();

router.param('userId', validateUserId);

router.get("/", authenticate, validateSearchQuery, controller.searchUsers);
router.get("/suggestions", authenticate, controller.getSuggestedUsers);
router.get("/account", authenticate, controller.getAccountData);
router.get("/:userId", authenticate, controller.getUser);

router.post("/signup", validateUserData, controller.createUser);
router.post("/login", validateUserAuth, controller.authenticateUser);

router.patch("/account", authenticate, validateUserData, controller.updateUser);
router.delete("/account", authenticate, controller.deleteUser);

router.get("/friends/:userId", authenticate, controller.getFriendsList);
router.post("/friends/:userId", authenticate, controller.addFriend);
router.patch("/friends/:userId", authenticate, controller.acceptFriend);
router.delete("/friends/:userId", authenticate, controller.removeFriend);


export default router;
