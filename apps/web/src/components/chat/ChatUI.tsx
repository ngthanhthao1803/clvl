"use client";

import { Send, ArrowLeft, MapPin, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  senderId?: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
};

type ChatUIProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  playersCount?: number;
  currentUserId?: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void> | void;
  typingLabel?: string;
};

const QUICK_CHAT_CHIPS = [
  "👋 Chào anh em, mình vừa vào kèo!",
  "🛵 Mình đang trên đường ra sân nhé",
  "🏸 Hôm nay đánh sân số mấy vậy Host ơi?",
  "⏰ Mình tới trễ khoảng 5-10p nhé!",
];

export function ChatUI({
  title,
  subtitle,
  backHref,
  playersCount,
  currentUserId,
  messages,
  onSendMessage,
  typingLabel,
}: ChatUIProps) {
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const nextMessage = content.trim();
    if (!nextMessage) return;
    setContent("");
    await onSendMessage(nextMessage);
  }

  return (
    <section className="mx-auto flex h-[calc(100vh-5.5rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <Link
              href={backHref as any}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition"
              title="Quay lại kèo đấu"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-sm sm:text-base font-extrabold text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="flex items-center gap-1 truncate text-[11px] text-slate-500 font-medium">
                <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="truncate">{subtitle}</span>
              </p>
            )}
          </div>
        </div>

        {playersCount !== undefined && (
          <div className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
            <Users className="h-3 w-3 text-emerald-600" />
            <span>{playersCount} thành viên</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/40 px-4 py-4 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              Phòng chat buổi chơi đã sẵn sàng
            </p>
            <p className="mt-0.5 max-w-xs text-[11px] text-slate-400">
              Hãy gửi lời chào hoặc chọn câu nhắn nhanh bên dưới để trao đổi với Host và các lông thủ!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = Boolean(
              currentUserId &&
                message.senderId &&
                String(currentUserId) === String(message.senderId),
            );

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 px-1 mb-0.5">
                  <span className="text-[10.5px] font-bold text-slate-500">
                    {isMe ? "Bạn" : message.senderName}
                  </span>
                  <span className="text-[9.5px] text-slate-400">
                    {message.createdAt}
                  </span>
                </div>
                <div
                  className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? "bg-emerald-600 text-white rounded-br-xs"
                      : "bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}
        {typingLabel ? (
          <p className="text-xs text-emerald-700 italic">{typingLabel}</p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {/* Quick Reply Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 bg-white px-3 pt-2 pb-1 scrollbar-none">
        {QUICK_CHAT_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSendMessage(chip)}
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 transition active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1.5 sm:px-4"
      >
        <input
          type="text"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Nhập tin nhắn trao đổi với nhóm..."
          className="h-10 flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Gửi</span>
        </button>
      </form>
    </section>
  );
}
