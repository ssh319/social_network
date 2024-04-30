import { Router } from 'express';

import * as controller from '../controllers/chatController.js';

import { validateChatId, validateMessage, validateMessageId } from '../validators/chatValidators.js';
import { checkChatAccess, checkMessageAccess } from '../middleware/chatAccess.js';

import { validateUserId } from '../validators/userValidators.js';


const router = Router();

router.get("/", controller.retrieveChats);
router.get("/:chatId", validateChatId, checkChatAccess, controller.getChat);

router.post("/:userId", validateUserId, controller.startChat);
router.delete("/:chatId", validateChatId, checkChatAccess, controller.deleteChat);


router.post(
    "/:chatId/messages",
    validateChatId,
    checkChatAccess,
    validateMessage,
    controller.sendMessage
);

router.patch(
    "/:chatId/messages/:messageId",
    validateChatId,
    validateMessageId,
    checkChatAccess,
    checkMessageAccess,
    validateMessage,
    controller.editMessage
);

router.delete(
    "/:chatId/messages/:messageId",
    validateChatId,
    validateMessageId,
    checkChatAccess,
    checkMessageAccess,
    controller.deleteMessage
);


router.patch(
    "/:chatId/messages/:messageId/read",
    validateChatId,
    validateMessageId,
    checkChatAccess,
    controller.readMessage
);


export default router;
