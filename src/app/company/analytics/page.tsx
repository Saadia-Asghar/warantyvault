"use client";

import { CompanyBottomNav } from "@/components/company-bottom-nav";
import { Navbar } from "@/components/navbar";
import { NotificationPanel } from "@/components/notification-panel";
import { useEffect, useState } from "react";

export default function CompanyAnalyticsPage() {
  const [data, setData] = useState<{
    kpis: Record<string, number>;
    byOutlet: Array<{
      shopName: string;
      city: string;
      approvalStatus: string;
      warranties: number;
      openClaims: number;
    }>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/company/analytics")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setData(j.data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <Navbar role="company" name="Network" />
      <div className="border-b border-[var(--border)] px-4 py-2">
        <div className="mx-auto flex max-w-lg justify-end md:max-w-2xl">
          <NotificationPanel />
        </div>
      </div>
      <main className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl">
        <div className="summary-card">
          <p className="text-sm text-[var(--text-muted)]">Network KPIs</p>
          <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">
            {data?.kpis.warranties ?? "—"}
          </p>
          <p className="mt-2 text-sm text-[var(--accent)]">
            warranties · {data?.kpis.claims ?? "—"} claims · {data?.kpis.fraudFlags ?? "—"} fraud flags
          </p>
        </div>

        <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          By outlet
        </h2>
        <div className="activity-feed">
          {data?.byOutlet.map((o) => (
            <div key={o.shopName + o.city} className="activity-row">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--text-primary)]">{o.shopName}</p>
                <p className="text-xs text-[var(--text-muted)]">{o.city} · {o.approvalStatus}</p>
              </div>
              <div className="text-right text-xs text-[var(--text-muted)]">
                <p>{o.warranties} issued</p>
                <p>{o.openClaims} open claims</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <CompanyBottomNav />
    </div>
  );
}
