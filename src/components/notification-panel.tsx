"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: string;
  type: string;
};

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    const json = await res.json();
    if (json.success) {
      setItems(json.data.notifications);
      setUnread(json.data.unread);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 12000);
    return () => clearInterval(interval);
  }, [load]);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    void load();
  }

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    void load();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-1.5 rounded-full bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,320px)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Notifications</p>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button type="button" onClick={() => void markAll()} className="text-xs text-[var(--accent)]">
                    Mark all read
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <li className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                  No notifications yet
                </li>
              ) : (
                items.map((n) => (
                  <li key={n.id} className={`border-b border-[var(--border)] last:border-b-0 ${!n.read ? "bg-[var(--accent-muted)]/50" : ""}`}>
                    {n.linkUrl ? (
                      <Link
                        href={n.linkUrl}
                        onClick={() => {
                          void markRead(n.id);
                          setOpen(false);
                        }}
                        className="block px-4 py-3 hover:bg-white/[0.02]"
                      >
                        <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{n.body}</p>
                      </Link>
                    ) : (
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{n.body}</p>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
