"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyBottomNav } from "@/components/company-bottom-nav";
import { Navbar } from "@/components/navbar";
import { NotificationPanel } from "@/components/notification-panel";
import { formatDate } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type FraudFlag = {
  id: string;
  serialImei: string;
  reason: string;
  createdAt: string;
  shop: { shopName: string; city: string } | null;
};

type Claim = {
  id: string;
  status: string;
  openedAt: string;
  issueDescription: string;
  shop: { shopName: string; city: string; sector: string | null };
  warranty: {
    productName: string;
    warrantyCode: string;
    buyerName: string | null;
    buyerPhone: string | null;
  };
};

export default function CompanyFraudPage() {
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    fetch("/api/company/fraud")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setFlags(j.data);
      });
    fetch("/api/company/claims")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setClaims(j.data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <Navbar role="company" name="Risk & claims" />
      <div className="border-b border-[var(--border)] px-4 py-2">
        <div className="mx-auto flex max-w-lg justify-end md:max-w-2xl">
          <NotificationPanel />
        </div>
      </div>
      <main className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Open network claims
        </h2>
        <div className="activity-feed mt-2">
          {claims.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              No open claims across your network.
            </div>
          ) : (
            claims.map((c) => (
              <div key={c.id} className="border-b border-[var(--border)] p-4 last:border-b-0">
                <p className="font-medium text-[var(--text-primary)]">{c.warranty.productName}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {c.shop.shopName} · {c.status} · {formatDate(c.openedAt)}
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{c.issueDescription}</p>
              </div>
            ))
          )}
        </div>

        <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Fraud flags
        </h2>
        <div className="activity-feed">
          {flags.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              No fraud flags recorded.
            </div>
          ) : (
            flags.map((f) => (
              <div key={f.id} className="activity-row">
                <div className="activity-icon text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-[var(--text-primary)]">
                    {f.serialImei}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{f.reason}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {f.shop?.shopName} · {formatDate(f.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <Link href="/company/warranties" className="btn-secondary mt-6 block w-full text-center">
          ← Back to warranties
        </Link>
      </main>
      <CompanyBottomNav />
    </div>
  );
}
