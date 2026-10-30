"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ChatUI, type ChatMessage } from "@/components/chat/ChatUI";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";

export default function ChatPage() {
  const params = useParams<{ sessionId: string }>();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const socket = useMemo(() => getSocket(token), [token]);

  const sessionQuery = useQuery({
    queryKey: ["session", params.sessionId],
    queryFn: async () => {
      const response = await api.get(`/sessions/${params.sessionId}`);
      return response.data.data.session;
    },
  });

  const messagesQuery = useQuery({
    queryKey: ["chat-messages", params.sessionId],
    queryFn: async () => {
      const response = await api.get(`/sessions/${params.sessionId}/messages`);
      return response.data.data.messages;
    },
  });

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(
        messagesQuery.data.map(
          (message: {
            _id: string;
            sender?: { _id?: string; id?: string; name?: string; avatar?: string };
            content: string;
            createdAt: string;
          }) => ({
            id: message._id,
            senderId: message.sender?._id || message.sender?.id,
            senderName: message.sender?.name ?? "Người chơi",
            senderAvatar: message.sender?.avatar,
            content: message.content,
            createdAt: new Date(message.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }),
        ),
      );
    }
  }, [messagesQuery.data]);

  useEffect(() => {
    socket.connect();
    socket.emit("session:join", { sessionId: params.sessionId });

    socket.on("message:new", (message) => {
      setMessages((previous) => {
        if (previous.some((m) => m.id === message._id)) {
          return previous;
        }
        return [
          ...previous,
          {
            id: message._id,
            senderId: message.sender?._id || message.sender?.id || message.sender,
            senderName: message.sender?.name ?? "Người chơi",
            senderAvatar: message.sender?.avatar,
            content: message.content,
            createdAt: new Date(message.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });
    });

    return () => {
      socket.emit("session:leave", { sessionId: params.sessionId });
      socket.off("message:new");
      socket.disconnect();
    };
  }, [params.sessionId, socket]);

  const session = sessionQuery.data;
  const chatTitle = session?.title || "Phòng Chat Buổi Chơi";
  const chatSubtitle = session
    ? `${session.venueName}${session.district ? ` · ${session.district}` : ""}`
    : undefined;

  return (
    <RequireAuth>
      <ChatUI
        title={chatTitle}
        subtitle={chatSubtitle}
        backHref={`/sessions/${params.sessionId}`}
        playersCount={session?.currentPlayersCount ?? session?.players?.length}
        currentUserId={user?.id}
        messages={messages}
        onSendMessage={async (content) => {
          socket.emit("message:send", { sessionId: params.sessionId, content });
        }}
      />
    </RequireAuth>
  );
}
