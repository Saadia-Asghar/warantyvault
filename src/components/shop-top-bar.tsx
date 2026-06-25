"use client";

import { NotificationPanel } from "@/components/notification-panel";

export function ShopTopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-deep)]">
      <div className="mx-auto flex max-w-lg items-start justify-between gap-3 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
        </div>
        <NotificationPanel />
      </div>
    </header>
  );
}
