"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShopBottomNav } from "@/components/shop-bottom-nav";
import { MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ThreadRow = {
  id: string;
  subject: string;
  status: string;
  lastMessageAt: string;
  unread: number;
  preview: string;
  buyerName?: string;
};

export default function ShopMessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadRow[]>([]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success || j.data?.session?.role !== "shop") {
          router.replace("/shop/auth");
        }
      });
  }, [router]);

  useEffect(() => {
    const load = () =>
      fetch("/api/threads", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setThreads(j.data.threads);
        });
    void load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <header className="border-b border-[var(--border)] px-4 py-4">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Customer messages</h1>
        <p className="text-xs text-[var(--text-muted)]">Reply to complaints & questions</p>
      </header>
      <main className="mx-auto max-w-lg px-4 py-4">
        {threads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-[var(--text-tertiary)]" />
            <p className="mt-3 text-sm text-[var(--text-muted)]">No customer messages yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map((t) => (
              <Link
                key={t.id}
                href={`/shop/messages/${t.id}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
              >
                <div className="flex justify-between gap-2">
                  <p className="font-medium text-[var(--text-primary)]">{t.subject}</p>
                  {t.unread > 0 && (
                    <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                      {t.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--accent)]">{t.buyerName}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{t.preview}</p>
                <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">{formatDate(t.lastMessageAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <ShopBottomNav />
    </div>
  );
}
