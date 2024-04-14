import { Router } from 'express';

import * as controller from '../controllers/chatController.js';

import {
    validateChatId,
    validateMessageId,
    validateChatAccess
} from '../validators/chatValidators.js';

import { validateUserId } from '../validators/userValidators.js';


const router = Router();

router.get("/", controller.retrieveChats);
router.get("/:chatId", validateChatId, validateChatAccess, controller.getChat);

router.post("/:userId", validateUserId, controller.startChat);
router.delete("/:chatId", validateChatId, validateChatAccess, controller.deleteChat);

router.post("/:chatId/messages", validateChatId, validateChatAccess, controller.sendMessage);

router.patch("/:chatId/messages/:messageId", validateChatId, validateMessageId, validateChatAccess, controller.editMessage);
router.delete("/:chatId/messages/:messageId", validateChatId, validateMessageId, validateChatAccess, controller.deleteMessage);
router.patch("/:chatId/messages/:messageId/read", validateChatId, validateMessageId, validateChatAccess, controller.readMessage);


export default router;
