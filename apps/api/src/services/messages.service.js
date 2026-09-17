import { Message } from "../models/Message.js";
import { Session } from "../models/Session.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notifications.service.js";

export async function listSessionMessages(sessionId, requesterId) {
  const session =
    await Session.findById(sessionId).populate("host players.user");

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  const isParticipant =
    session.host._id.toString() === requesterId ||
    session.players.some(
      (entry) => entry.user?._id?.toString() === requesterId,
    );

  if (!isParticipant) {
    throw new AppError("Only session participants can view messages", 403);
  }

  return Message.find({ session: sessionId })
    .sort({ createdAt: 1 })
    .populate("sender");
}

export async function sendSessionMessage({
  sessionId,
  senderId,
  content,
  type = "text",
}) {
  const session =
    await Session.findById(sessionId).populate("host players.user");

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  const isParticipant =
    session.host._id.toString() === senderId ||
    session.players.some((entry) => entry.user?._id?.toString() === senderId);

  if (!isParticipant) {
    throw new AppError("Only session participants can send messages", 403);
  }

  const message = await Message.create({
    session: sessionId,
    sender: senderId,
    content,
    type,
  });

  if (session.host._id.toString() !== senderId) {
    await createNotification({
      recipient: session.host._id,
      actor: senderId,
      type: "chat_message",
      title: "New session message",
      message: `You have a new message in ${session.title}`,
      session: sessionId,
    });
  }

  return message.populate("sender");
}

export async function updateSessionMessage({
  sessionId,
  messageId,
  senderId,
  content,
}) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  const message = await Message.findOne({ _id: messageId, session: sessionId });

  if (!message) {
    throw new AppError("Message not found", 404);
  }

  const canEdit =
    message.sender.toString() === senderId ||
    session.host.toString() === senderId;
  if (!canEdit) {
    throw new AppError("You cannot edit this message", 403);
  }

  message.content = content;
  message.editedAt = new Date();
  await message.save();

  return message.populate("sender");
}

export async function deleteSessionMessage({ sessionId, messageId, senderId }) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  const message = await Message.findOne({ _id: messageId, session: sessionId });

  if (!message) {
    throw new AppError("Message not found", 404);
  }

  const canDelete =
    message.sender.toString() === senderId ||
    session.host.toString() === senderId;
  if (!canDelete) {
    throw new AppError("You cannot delete this message", 403);
  }

  await message.deleteOne();
  return true;
}
