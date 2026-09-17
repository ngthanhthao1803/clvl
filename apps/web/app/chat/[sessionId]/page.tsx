"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ChatUI } from "@/components/chat/ChatUI";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";

export default function ChatPage() {
  const params = useParams<{ sessionId: string }>();
  const token = useAuthStore((state) => state.token);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      senderName: string;
      content: string;
      createdAt: string;
    }>
  >([]);

  const socket = useMemo(() => getSocket(token), [token]);

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
            sender: { name: string };
            content: string;
            createdAt: string;
          }) => ({
            id: message._id,
            senderName: message.sender?.name ?? "Người chơi",
            content: message.content,
            createdAt: new Date(message.createdAt).toLocaleTimeString([], {
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
      setMessages((previous) => [
        ...previous,
        {
          id: message._id,
          senderName: message.sender?.name ?? "Player",
          content: message.content,
          createdAt: new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    });

    return () => {
      socket.emit("session:leave", { sessionId: params.sessionId });
      socket.off("message:new");
      socket.disconnect();
    };
  }, [params.sessionId, socket]);

  return (
    <RequireAuth>
      <ChatUI
        title={`Chat buổi chơi ${params.sessionId}`}
        messages={messages}
        onSendMessage={async (content) => {
          socket.emit("message:send", { sessionId: params.sessionId, content });
        }}
      />
    </RequireAuth>
  );
}
