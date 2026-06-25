"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Info } from "lucide-react";

const TIPS: Record<string, { title: string; body: string; cta?: { label: string; href: string } }> = {
  buyer: {
    title: "Customer wallet",
    body: "Pending warranties need your Accept. Use Map for nearby outlets, Scan to verify a code, Chat to message the selling shop.",
    cta: { label: "Find outlets near me", href: "/nearby" },
  },
  shop: {
    title: "Outlet dashboard",
    body: "Issue → customer accepts → QR in their wallet. Search Warranty records for any customer (including expired). Verify scans QR at claim time.",
    cta: { label: "Warranty records", href: "/shop/records" },
  },
  company: {
    title: "Brand network",
    body: "Approve outlets before they can issue network warranties. Customers can buy at one city and claim at any approved outlet of your brand.",
    cta: { label: "Review outlets", href: "/company" },
  },
};

type ContextBannerProps = {
  role: "buyer" | "shop" | "company";
};

export function ContextBanner({ role }: ContextBannerProps) {
  const [visible, setVisible] = useState(false);
  const tip = TIPS[role];

  useEffect(() => {
    const key = `wv_tip_${role}`;
    if (!sessionStorage.getItem(key)) setVisible(true);
  }, [role]);

  if (!visible) return null;

  function dismiss() {
    sessionStorage.setItem(`wv_tip_${role}`, "1");
    setVisible(false);
  }

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">{tip.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">{tip.body}</p>
          {tip.cta && (
            <Link href={tip.cta.href} className="mt-2 inline-block text-xs font-medium text-[var(--accent)] hover:underline">
              {tip.cta.label} →
            </Link>
          )}
        </div>
        <button type="button" onClick={dismiss} className="shrink-0 rounded-lg p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
