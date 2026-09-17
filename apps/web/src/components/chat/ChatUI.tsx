"use client";

import { Send } from "lucide-react";
import { useState } from "react";

type ChatMessage = {
  id: string;
  senderName: string;
  content: string;
  createdAt: string;
};

type ChatUIProps = {
  title: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void> | void;
  typingLabel?: string;
};

export function ChatUI({
  title,
  messages,
  onSendMessage,
  typingLabel,
}: ChatUIProps) {
  const [content, setContent] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMessage = content.trim();
    if (!nextMessage) return;
    setContent("");
    await onSendMessage(nextMessage);
  }

  return (
    <section className="flex h-[70vh] flex-col rounded-[2rem] border border-slate-200 bg-white shadow-glow">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">Chat buổi chơi thời gian thực</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((message) => (
          <div key={message.id} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{message.senderName}</span>
              <span>{message.createdAt}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {message.content}
            </p>
          </div>
        ))}
        {typingLabel ? (
          <p className="text-xs text-emerald-700">{typingLabel}</p>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 border-t border-slate-200 p-4"
      >
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={2}
          placeholder="Viết tin nhắn..."
          className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400/40"
        />
        <button
          type="submit"
          className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          <Send className="h-4 w-4" /> Gửi
        </button>
      </form>
    </section>
  );
}
