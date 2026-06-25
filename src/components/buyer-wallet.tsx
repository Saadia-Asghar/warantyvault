"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BuyerBottomNav } from "@/components/buyer-bottom-nav";
import { ContextBanner } from "@/components/context-banner";
import { NotificationPanel } from "@/components/notification-panel";
import {
  bucketLabel,
  type ReminderKind,
  type WarrantyBucket,
  type WarrantyReminder,
} from "@/lib/warranty-buckets";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  ChevronRight,
  Package,
  RefreshCw,
  Shield,
  X,
} from "lucide-react";

type WarrantyRow = {
  id: string;
  productName: string;
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  bucket: WarrantyBucket;
  shop: { shopName: string; city: string };
};

type WalletData = {
  warranties: WarrantyRow[];
  reminders: WarrantyReminder[];
  buckets: Record<WarrantyBucket, WarrantyRow[]>;
  summary?: {
    totalPurchases: number;
    activeWarranties: number;
    pendingAccept: number;
    totalSpent: number;
  };
};

const TABS: { id: WarrantyBucket; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "in_claim", label: "In claim" },
  { id: "used", label: "Used" },
  { id: "expired", label: "Expired" },
  { id: "pending", label: "Pending" },
  { id: "revoked", label: "Revoked" },
];

const reminderClass: Record<ReminderKind, string> = {
  EXPIRED: "alert-banner-danger",
  EXPIRING_7: "alert-banner-warning",
  EXPIRING_30: "alert-banner-warning",
  HALFWAY: "alert-banner-info",
};

function statusLine(w: WarrantyRow): string {
  if (w.bucket === "available" && w.daysRemaining > 0) {
    return `Expires in ${w.daysRemaining} day${w.daysRemaining === 1 ? "" : "s"}`;
  }
  if (w.bucket === "in_claim") return "Claim in progress";
  if (w.bucket === "used") return "Repair or exchange completed";
  if (w.bucket === "expired") return "Expired";
  if (w.bucket === "pending") return w.status === "PENDING_RESALE" ? "Resale pending" : "Tap to accept";
  return formatDate(w.endDate);
}

export function BuyerWalletClient({ name }: { name: string }) {
  const [data, setData] = useState<WalletData | null>(null);
  const [tab, setTab] = useState<WarrantyBucket>("available");
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  async function dismissReminder(warrantyId: string, kind: ReminderKind) {
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warrantyId, reminderType: kind, action: "dismiss" }),
    });
    void load();
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/warranties/buyer", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastSync(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 15000);
    return () => clearInterval(interval);
  }, [load]);

  const summary = useMemo(() => {
    if (!data) return { active: 0, expiring: 0, nearest: null as number | null };
    const active =
      data.buckets.available.length + data.buckets.in_claim.length;
    const expiring = data.reminders.filter(
      (r) => r.kind === "EXPIRING_7" || r.kind === "EXPIRING_30"
    ).length;
    const nearest =
      data.buckets.available.length > 0
        ? Math.min(...data.buckets.available.map((w) => w.daysRemaining))
        : null;
    return { active, expiring, nearest };
  }, [data]);

  const visibleReminders = data?.reminders.slice(0, 2) ?? [];

  const list = data?.buckets[tab] ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <ContextBanner role="buyer" />
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-deep)]">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Good to see you</p>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">{name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPanel />
            <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-full bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${lastSync ? "bg-[var(--accent)]" : "bg-[var(--text-tertiary)]"}`}
            />
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Live
          </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Chime balance card → warranty summary */}
        <div className="summary-card">
          <p className="text-sm text-[var(--text-muted)]">Your purchases</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {data?.summary?.totalPurchases ?? 0} product
            {(data?.summary?.totalPurchases ?? 0) === 1 ? "" : "s"}
          </p>
          {(data?.summary?.totalSpent ?? 0) > 0 && (
            <p className="mt-2 text-sm font-medium text-[var(--accent)]">
              ₨{Math.round(data!.summary!.totalSpent).toLocaleString("en-PK")} total spent
            </p>
          )}
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {data?.summary?.activeWarranties ?? summary.active} under warranty
            {(data?.summary?.pendingAccept ?? 0) > 0 &&
              ` · ${data!.summary!.pendingAccept} to accept`}
          </p>
          {summary.nearest !== null && summary.active > 0 && (
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              Nearest expiry · {summary.nearest} day{summary.nearest === 1 ? "" : "s"}
            </p>
          )}
          {(data?.summary?.totalPurchases ?? 0) === 0 && (
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              When a shop records a sale to your number, it appears here.
            </p>
          )}
          <Link
            href="/nearby"
            className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
          >
            Find shops near me →
          </Link>
        </div>

        {/* Alert banners — max 2, dismissible */}
        {visibleReminders.length > 0 && (
          <div className="mt-4 space-y-2">
            {visibleReminders.map((r) => (
              <div
                key={`${r.warrantyId}-${r.kind}`}
                className={`alert-banner ${reminderClass[r.kind]}`}
              >
                <Bell className="mt-0.5 h-4 w-4 shrink-0" />
                <Link
                  href={`/buyer/warranty/${r.warrantyId}`}
                  className="flex-1 text-sm leading-snug"
                >
                  {r.message}
                </Link>
                <button
                  type="button"
                  onClick={() => void dismissReminder(r.warrantyId, r.kind)}
                  className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chime pill tabs */}
        <div className="pill-tabs mt-6">
          {TABS.map((t) => {
            const count = data?.buckets[t.id]?.length ?? 0;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`pill-tab ${active ? "pill-tab-active" : "pill-tab-inactive"}`}
              >
                {t.label}
                {count > 0 && ` ${count}`}
              </button>
            );
          })}
        </div>

        {/* Activity feed */}
        <section className="mt-4">
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            {bucketLabel(tab)}
          </h2>

          {list.length > 0 ? (
            <div className="activity-feed">
              {list.map((w) => (
                <Link key={w.id} href={`/buyer/warranty/${w.id}`} className="activity-row">
                  <div className="activity-icon">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--text-primary)]">
                      {w.productName}
                    </p>
                    <p className="truncate text-sm text-[var(--text-muted)]">
                      {w.shop.shopName} · {w.shop.city}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">{statusLine(w)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--text-tertiary)]" />
                </Link>
              ))}
            </div>
          ) : !loading ? (
            <div className="activity-feed px-4 py-12 text-center">
              <Shield className="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-muted)]">
                {tab === "available"
                  ? "No warranties yet — when a shop issues one to your number, it'll show up here."
                  : `Nothing in ${bucketLabel(tab).toLowerCase()}`}
              </p>
            </div>
          ) : null}
        </section>

        <Link href="/verify" className="btn-primary mt-8 w-full">
          Verify a warranty hash
        </Link>
      </main>

      <BuyerBottomNav />
    </div>
  );
}
