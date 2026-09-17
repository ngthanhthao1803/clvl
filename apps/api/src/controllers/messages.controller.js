import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteSessionMessage,
  listSessionMessages,
  sendSessionMessage,
  updateSessionMessage,
} from "../services/messages.service.js";

export const listMessagesController = asyncHandler(async (req, res) => {
  const messages = await listSessionMessages(
    req.params.sessionId,
    req.user.sub,
  );
  res.json({ success: true, data: { messages } });
});

export const sendMessageController = asyncHandler(async (req, res) => {
  const message = await sendSessionMessage({
    sessionId: req.params.sessionId,
    senderId: req.user.sub,
    content: req.body.content,
    type: req.body.type,
  });

  res.status(201).json({ success: true, data: { message } });
});

export const updateMessageController = asyncHandler(async (req, res) => {
  const message = await updateSessionMessage({
    sessionId: req.params.sessionId,
    messageId: req.params.id,
    senderId: req.user.sub,
    content: req.body.content,
  });

  res.json({ success: true, data: { message } });
});

export const deleteMessageController = asyncHandler(async (req, res) => {
  await deleteSessionMessage({
    sessionId: req.params.sessionId,
    messageId: req.params.id,
    senderId: req.user.sub,
  });

  res.json({ success: true, message: "Message deleted" });
});
