"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BuyerBottomNav } from "@/components/buyer-bottom-nav";
import { ContextBanner } from "@/components/context-banner";
import { NotificationPanel } from "@/components/notification-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrDisplay } from "@/components/qr-display";
import {
  daysUntil,
  formatDate,
  policyTypeLabel,
  warrantyStatusLabel,
} from "@/lib/utils";
import { AuditTimeline } from "@/components/audit-timeline";
import { ArrowLeft, Check, Copy, ExternalLink, Shield } from "lucide-react";

type WarrantyDetail = {
  id: string;
  warrantyCode: string;
  productName: string;
  policyType: string;
  status: string;
  startDate: string;
  endDate: string;
  termsEn: string;
  termsUr: string;
  exclusions: string;
  warrantyHash: string;
  chainTxRegister: string | null;
  purchaseSector: string | null;
  purchaseCity: string | null;
  shop: { shopName: string; city: string; phone: string };
  company?: { brandName: string } | null;
  claims: Array<{ id: string; status: string; openedAt: string }>;
};

function totalDays(start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
}

export default function BuyerWarrantyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [warranty, setWarranty] = useState<WarrantyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch(`/api/warranties/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setWarranty(j.data.warranty);
        else setError(j.error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function accept() {
    setAccepting(true);
    const res = await fetch(`/api/warranties/${id}`, { method: "POST" });
    const json = await res.json();
    setAccepting(false);
    if (json.success) {
      load();
      router.refresh();
    } else {
      setError(json.error);
    }
  }

  function copyHash() {
    if (warranty?.warrantyHash) {
      navigator.clipboard.writeText(warranty.warrantyHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-[var(--text-muted)]">
          Loading…
        </main>
        <BuyerBottomNav />
      </div>
    );
  }

  if (!warranty) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-red-400">{error || "Warranty not found"}</p>
          <Link href="/buyer" className="btn-secondary mt-4 inline-flex">
            Back
          </Link>
        </main>
        <BuyerBottomNav />
      </div>
    );
  }

  const days = daysUntil(warranty.endDate);
  const total = totalDays(warranty.startDate, warranty.endDate);
  const elapsed = Math.max(0, total - days);
  const progress = Math.min(100, Math.round((elapsed / total) * 100));
  const halfway = 50;
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify?hash=${warranty.warrantyHash}`;

  const statusHeadline =
    warranty.status === "ACTIVE" && days > 0
      ? `Valid · ${days} days left`
      : warranty.status === "EXPIRED"
        ? "Expired"
        : warrantyStatusLabel(warranty.status);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <ContextBanner role="buyer" />
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link
            href="/buyer"
            className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" /> Wallet
          </Link>
          <NotificationPanel />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="summary-card">
          <p className="font-mono text-xs text-[var(--text-tertiary)]">{warranty.warrantyCode}</p>
          <h1 className="mt-1 text-xl font-bold text-[var(--text-primary)]">{warranty.productName}</h1>
          <p className="mt-2 text-lg font-semibold text-[var(--accent)]">{statusHeadline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant={
                warranty.status === "ACTIVE"
                  ? "active"
                  : warranty.status === "PENDING_TRANSFER"
                    ? "pending"
                    : warranty.status === "EXPIRED"
                      ? "expired"
                      : "default"
              }
            >
              {warrantyStatusLabel(warranty.status)}
            </Badge>
            {warranty.company?.brandName && (
              <span className="text-xs text-[var(--text-muted)]">
                {warranty.company.brandName} network
              </span>
            )}
          </div>
        </div>

        {warranty.company?.brandName && (
          <div className="alert-banner alert-banner-info mt-4">
            <Shield className="h-4 w-4 shrink-0" />
            <p className="text-sm">
              Claim at any approved {warranty.company.brandName} outlet
              {warranty.purchaseSector ? ` · Purchased at ${warranty.purchaseSector}` : ""}
            </p>
          </div>
        )}

        {warranty.status === "PENDING_TRANSFER" && (
          <div className="alert-banner alert-banner-warning mt-4">
            <p className="flex-1 text-sm">Accept to add this warranty to your wallet</p>
            <Button className="btn-primary-sm shrink-0" onClick={accept} loading={accepting}>
              Accept
            </Button>
          </div>
        )}

        {warranty.status === "ACTIVE" && (
          <>
            <div className="mt-6 flex justify-center rounded-2xl border border-[var(--border)] bg-white p-6">
              <QrDisplay value={verifyUrl} size={180} />
            </div>
            <p className="mt-2 text-center text-xs text-[var(--text-tertiary)]">
              Show this QR at any approved outlet
            </p>

            {days > 0 && (
              <div className="mt-6">
                <div className="mb-1 flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Warranty period</span>
                  <span>{progress}% elapsed</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-0.5 bg-amber-400/80"
                    style={{ left: `${halfway}%` }}
                    title="Halfway point"
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                  Halfway marker · Expires {formatDate(warranty.endDate)}
                </p>
              </div>
            )}

            <div className="activity-feed mt-6">
              {[
                ["Shop", `${warranty.shop.shopName}, ${warranty.shop.city}`],
                ["Policy", policyTypeLabel(warranty.policyType)],
                ["Started", formatDate(warranty.startDate)],
                ["Expires", formatDate(warranty.endDate)],
              ].map(([label, value]) => (
                <div key={label} className="activity-row">
                  <span className="w-20 shrink-0 text-sm text-[var(--text-tertiary)]">{label}</span>
                  <span className="flex-1 text-sm text-[var(--text-primary)]">{value}</span>
                </div>
              ))}
              <div className="activity-row">
                <span className="w-20 shrink-0 text-sm text-[var(--text-tertiary)]">Hash</span>
                <code className="min-w-0 flex-1 truncate font-mono text-[10px] text-[var(--text-muted)]">
                  {warranty.warrantyHash}
                </code>
                <button type="button" onClick={copyHash} className="btn-secondary shrink-0 px-2 py-2">
                  {copied ? <Check className="h-4 w-4 text-[var(--accent)]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {warranty.chainTxRegister && (
              <Link
                href={`/verify/chain?tx=${warranty.chainTxRegister}`}
                className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
              >
                View on registry <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </>
        )}

        <div className="mt-8 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm">
          <p className="font-medium text-[var(--text-primary)]">Terms</p>
          <p className="text-[var(--text-muted)] leading-relaxed">{warranty.termsEn}</p>
          <p className="text-[var(--text-muted)] leading-relaxed" dir="rtl">
            {warranty.termsUr}
          </p>
          {warranty.exclusions && (
            <p className="text-xs text-[var(--text-tertiary)]">Exclusions: {warranty.exclusions}</p>
          )}
        </div>

        {warranty.claims.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Claim history
            </h2>
            <div className="activity-feed">
              {warranty.claims.map((c) => (
                <div key={c.id} className="activity-row">
                  <span className="text-sm text-[var(--text-primary)]">{c.status}</span>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">
                    {formatDate(c.openedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <AuditTimeline warrantyId={id} />

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </main>

      <BuyerBottomNav />
    </div>
  );
}
