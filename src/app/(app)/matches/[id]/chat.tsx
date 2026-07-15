"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { sendMessage, getMessages, type ChatMessage } from "@/app/actions/chat";
import { formatTime } from "@/lib/format";

export function Chat({
  matchId,
  meId,
  initial,
}: {
  matchId: string;
  meId: string;
  initial: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [text, setText] = useState("");
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Polling dei nuovi messaggi
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        setMessages(await getMessages(matchId));
      } catch {
        /* ignora errori temporanei di rete */
      }
    }, 3000);
    return () => clearInterval(t);
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    startTransition(async () => {
      const res = await sendMessage(matchId, body);
      if (res.ok && res.message) {
        setMessages((prev) => [...prev, res.message!]);
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-[var(--muted)]">
            No messages yet. Break the ice! 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === meId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? "brand-gradient rounded-br-md text-white"
                    : "rounded-bl-md bg-white text-[var(--foreground)] shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`mt-0.5 text-[10px] ${
                    mine ? "text-white/70" : "text-[var(--muted)]"
                  }`}
                >
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-[var(--border)] bg-white px-3 py-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-base outline-none focus:border-[var(--primary)]"
        />
        <button
          type="submit"
          aria-label="Send"
          className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
