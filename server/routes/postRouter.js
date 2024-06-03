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

router.param('postId', validatePostId);

router.param('commentId', validateCommentId);

router.get("/feed", controller.getPostsFeed);
router.get("/:postId", controller.getPost);

router.post("/", validatePost, controller.createPost);
router.delete("/:postId", checkPostAccess, controller.deletePost);

router.post("/:postId/likes", controller.likePost);
router.delete("/:postId/likes", controller.unlikePost);

router.post("/:postId/comments", validateComment, controller.sendPostComment);
router.delete("/:postId/comments/:commentId", checkCommentAccess, controller.deletePostComment);

router.post("/:postId/comments/:commentId/likes", controller.likePostComment);
router.delete("/:postId/comments/:commentId/likes", controller.unlikePostComment);


export default router;
