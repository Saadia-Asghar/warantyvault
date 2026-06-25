"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { showBrowserNotification } from "@/lib/browser-notify";
import { formatDate } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";

type Message = {
  id: string;
  senderId: string;
  senderRole: string;
  body: string;
  createdAt: string;
};

type ThreadMeta = {
  id: string;
  subject: string;
  status: string;
  shop?: { shopName: string; city: string };
  buyer?: { name: string };
  warranty?: { warrantyCode: string; productName: string } | null;
};

export function ChatThreadView({
  threadId,
  role,
  userId,
  backHref,
}: {
  threadId: string;
  role: "buyer" | "shop";
  userId: string;
  backHref: string;
}) {
  const [thread, setThread] = useState<ThreadMeta | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/threads/${threadId}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const nextMessages: Message[] = json.data.messages;
      if (
        lastCountRef.current > 0 &&
        nextMessages.length > lastCountRef.current
      ) {
        const latest = nextMessages[nextMessages.length - 1];
        if (latest.senderId !== userId) {
          showBrowserNotification(
            role === "buyer" ? "Shop replied" : "Customer message",
            latest.body.slice(0, 120),
            role === "buyer" ? `/buyer/messages/${threadId}` : `/shop/messages/${threadId}`
          );
        }
      }
      lastCountRef.current = nextMessages.length;
      setThread(json.data.thread);
      setMessages(nextMessages);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [threadId, userId, role]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || thread?.status !== "OPEN") return;
    setSending(true);
    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setText("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function setStatus(status: "OPEN" | "RESOLVED") {
    await fetch(`/api/threads/${threadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  const title =
    role === "buyer"
      ? thread?.shop?.shopName ?? "Shop"
      : thread?.buyer?.name ?? "Customer";

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col pb-24">
      <header className="border-b border-[var(--border)] px-4 py-3">
        <a href={backHref} className="text-xs text-[var(--accent)] hover:underline">
          ← Back to messages
        </a>
        <h1 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{thread?.subject}</h1>
        <p className="text-xs text-[var(--text-muted)]">
          {title}
          {thread?.warranty && ` · ${thread.warranty.warrantyCode}`}
          {thread?.status === "RESOLVED" && " · Resolved"}
        </p>
      </header>

      <div
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((m) => {
          const mine = m.senderId === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-[var(--text-tertiary)]"}`}
                >
                  {formatDate(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 text-xs text-red-400">{error}</p>}

      {thread?.status === "OPEN" ? (
        <form
          onSubmit={send}
          className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--bg-deep)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static"
        >
          <div className="mx-auto flex max-w-lg gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Type your message
            </label>
            <input
              id="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="input-field min-h-[44px] flex-1"
              autoComplete="off"
            />
            <Button type="submit" loading={sending} disabled={!text.trim()} className="min-h-[44px] min-w-[44px] px-4">
              <Send className="h-4 w-4" aria-hidden />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="border-t border-[var(--border)] p-4 text-center text-sm text-[var(--text-muted)]">
          This conversation is resolved.
          <button type="button" onClick={() => void setStatus("OPEN")} className="ml-2 text-[var(--accent)] underline">
            Reopen
          </button>
        </div>
      )}

      {thread?.status === "OPEN" && (
        <button
          type="button"
          onClick={() => void setStatus("RESOLVED")}
          className="mx-auto mt-2 text-xs text-[var(--text-tertiary)] underline"
        >
          Mark as resolved
        </button>
      )}
    </div>
  );
}
