import { Server } from "socket.io";
import { env } from "../config/env.js";
import { verifyJwt } from "../utils/token.js";
import { socketEvents } from "../utils/socketEvents.js";
import { sendSessionMessage } from "../services/messages.service.js";
import { Session } from "../models/Session.js";

const onlineUsers = new Map();

function resolveToken(socket) {
  const authToken = socket.handshake.auth?.token;
  const bearer = socket.handshake.headers.authorization;
  const headerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7) : null;

  return authToken ?? headerToken ?? null;
}

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: env.nodeEnv === "production" ? env.clientOrigin : true,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = resolveToken(socket);

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      socket.user = verifyJwt(token);
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on(socketEvents.connection, (socket) => {
    const userId = socket.user.sub;
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit(socketEvents.onlineStatus, { userId, online: true });

    socket.on(socketEvents.sessionJoin, async ({ sessionId }) => {
      try {
        const session =
          await Session.findById(sessionId).populate("host players.user");
        if (!session) {
          socket.emit("session:join:error", { message: "Session not found" });
          return;
        }

        const isParticipant =
          session.host._id.toString() === userId ||
          session.players.some(
            (entry) => entry.user?._id?.toString() === userId,
          );

        if (!isParticipant) {
          socket.emit("session:join:error", {
            message: "Only session participants can join chat",
          });
          return;
        }

        socket.join(`session:${sessionId}`);
        socket.to(`session:${sessionId}`).emit(socketEvents.sessionUpdated, {
          sessionId,
          userId,
          action: "join",
        });
      } catch (err) {
        socket.emit("session:join:error", {
          message: "Unable to join session",
        });
      }
    });

    socket.on(socketEvents.sessionLeave, ({ sessionId }) => {
      socket.leave(`session:${sessionId}`);
      socket.to(`session:${sessionId}`).emit(socketEvents.sessionUpdated, {
        sessionId,
        userId,
        action: "leave",
      });
    });

    socket.on(socketEvents.typingStart, ({ sessionId }) => {
      socket
        .to(`session:${sessionId}`)
        .emit(socketEvents.typingStart, { sessionId, userId });
    });

    socket.on(socketEvents.typingStop, ({ sessionId }) => {
      socket
        .to(`session:${sessionId}`)
        .emit(socketEvents.typingStop, { sessionId, userId });
    });

    socket.on(socketEvents.messageSend, async (payload, ack) => {
      try {
        const message = await sendSessionMessage({
          sessionId: payload.sessionId,
          senderId: userId,
          content: payload.content,
          type: payload.type ?? "text",
        });

        io.to(`session:${payload.sessionId}`).emit(
          socketEvents.messageNew,
          message,
        );
        ack?.({ success: true, message });
      } catch (error) {
        ack?.({ success: false, message: error.message });
      }
    });

    socket.on(socketEvents.disconnect, () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit(socketEvents.onlineStatus, {
        userId,
        online: false,
      });
    });
  });

  return io;
}
