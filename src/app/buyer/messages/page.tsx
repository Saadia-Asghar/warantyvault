"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BuyerBottomNav } from "@/components/buyer-bottom-nav";
import { MessageCircle, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ThreadRow = {
  id: string;
  subject: string;
  status: string;
  lastMessageAt: string;
  unread: number;
  preview: string;
  shopName?: string;
};

export default function BuyerMessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success || j.data?.session?.role !== "buyer") {
          router.replace("/buyer/auth");
        }
      });
  }, [router]);

  useEffect(() => {
    const load = () =>
      fetch("/api/threads", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setThreads(j.data.threads);
        })
        .finally(() => setLoading(false));

    void load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-deep)] px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Messages</h1>
            <p className="text-xs text-[var(--text-muted)]">Chat with shopkeepers</p>
          </div>
          <Link href="/buyer/messages/new" className="btn-primary btn-primary-sm inline-flex items-center gap-1">
            <Plus className="h-4 w-4" /> New
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {loading && <p className="text-sm text-[var(--text-muted)]">Loading…</p>}
        {!loading && threads.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-[var(--text-tertiary)]" />
            <p className="mt-3 text-sm text-[var(--text-muted)]">No conversations yet</p>
            <Link href="/buyer/messages/new" className="mt-4 inline-block text-sm text-[var(--accent)] underline">
              Message a shop
            </Link>
          </div>
        )}
        <div className="space-y-2">
          {threads.map((t) => (
            <Link
              key={t.id}
              href={`/buyer/messages/${t.id}`}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-[var(--text-primary)]">{t.subject}</p>
                {t.unread > 0 && (
                  <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                    {t.unread}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--accent)]">{t.shopName}</p>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{t.preview}</p>
              <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">{formatDate(t.lastMessageAt)}</p>
            </Link>
          ))}
        </div>
      </main>
      <BuyerBottomNav />
    </div>
  );
}
