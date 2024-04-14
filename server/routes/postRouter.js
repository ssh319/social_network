import { Router } from 'express';

import * as controller from '../controllers/postController.js';

import {
    validatePostId,
    // validatePostAccess
} from '../validators/postValidators.js';


const router = Router();


router.get("/:postId", validatePostId, controller.getPost);
router.post("/", /*validatePost,*/ controller.createPost);
router.patch("/:postId", validatePostId, /*validatePostAccess,*/ /*validatePost*/ controller.editPost);
router.delete("/:postId", validatePostId, /*validatePostAccess, */ controller.deletePost);


export default router;
