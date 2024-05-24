import { Router } from 'express';

import * as controller from '../controllers/postController.js';

import {
    validatePostId,
    validatePost,
    validateCommentId,
    validateComment
} from '../validators/postValidators.js';

import { checkPostAccess, checkCommentAccess } from '../middleware/postAccess.js';


const router = Router();

router.get("/feed", controller.getPostsFeed);
router.get("/:postId", validatePostId, controller.getPost);

router.post("/", validatePost, controller.createPost);
router.delete("/:postId", validatePostId, checkPostAccess, controller.deletePost);

router.post("/:postId/likes", validatePostId, controller.likePost);
router.delete("/:postId/likes", validatePostId, controller.unlikePost);


router.post(
    "/:postId/comments",
    validatePostId,
    validateComment,
    controller.sendPostComment
);


router.delete(
    "/:postId/comments/:commentId",
    validatePostId,
    validateCommentId,
    checkCommentAccess,
    controller.deletePostComment
);

router.post(
    "/:postId/comments/:commentId/likes",
    validatePostId,
    validateCommentId,
    controller.likePostComment
);

router.delete(
    "/:postId/comments/:commentId/likes",
    validatePostId,
    validateCommentId,
    controller.unlikePostComment
);


export default router;
