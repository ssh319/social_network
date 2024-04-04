import { Router } from 'express';

import * as controller from '../controllers/userController.js';

import authenticateUser from '../middleware/authenticateUser.js';

import { 
    validateUserData,
    validateUserLogin,
    validateUserId
} from '../validators/userValidators.js';


const router = Router();

router.get("/", controller.searchUsers);
router.get("/:id", validateUserId, controller.getUser);

router.post("/signup", validateUserData, controller.createUser);
router.post("/login", validateUserLogin, controller.authenticateUser);

router.patch("/account", authenticateUser, validateUserData, controller.updateUser);
router.delete("/account", authenticateUser, controller.deleteUser);

router.patch("/update_online", authenticateUser, controller.updateOnline);

router.post("/friends/:id", authenticateUser, validateUserId, controller.addFriend);
router.patch("/friends/:id", authenticateUser, validateUserId, controller.acceptFriend);
router.delete("/friends/:id", authenticateUser, validateUserId, controller.removeFriend);


export default router;
