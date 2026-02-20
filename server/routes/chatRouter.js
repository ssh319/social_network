import { Router } from 'express';

import * as controller from '../controllers/chatController.js';
import { checkChatAccess, checkMessageAccess } from '../middleware/chatAccess.js';

import {
    validateChatId,
    validateMessage,
    validateMessageId
} from '../validators/chatValidators.js';

import { validateUserId } from '../validators/userValidators.js';


const router = Router();

router.param('chatId', validateChatId);
router.param('chatId', checkChatAccess);

router.param('messageId', validateMessageId);

router.param('userId', validateUserId);

router.get("/", controller.retrieveChats);
router.get("/:chatId", controller.getChat);

router.post("/:userId", controller.getOrCreateChat);
router.delete("/:chatId", controller.deleteChat);

router.post("/:chatId/messages", validateMessage, controller.sendMessage);
router.patch("/:chatId/messages/:messageId", checkMessageAccess, validateMessage, controller.editMessage);
router.delete("/:chatId/messages/:messageId", checkMessageAccess, controller.deleteMessage);

router.patch("/:chatId/messages/:messageId/read", controller.readMessage);


export default router;
