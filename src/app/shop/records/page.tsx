"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShopBottomNav } from "@/components/shop-bottom-nav";
import { ContextBanner } from "@/components/context-banner";
import { ShopTopBar } from "@/components/shop-top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, warrantyStatusLabel } from "@/lib/utils";
import { Archive, Search } from "lucide-react";

type Record = {
  id: string;
  warrantyCode: string;
  productName: string;
  status: string;
  buyerName: string | null;
  buyerPhone: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  shop: { shopName: string; city: string; sector: string | null };
  company: { brandName: string } | null;
  buyer: { name: string; phone: string } | null;
};

function statusVariant(status: string) {
  if (status === "ACTIVE") return "active";
  if (status === "PENDING_TRANSFER") return "pending";
  if (status === "EXPIRED") return "expired";
  if (status === "REVOKED") return "expired";
  return "default";
}

export default function ShopRecordsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [dateMonth, setDateMonth] = useState("");
  const [dateField, setDateField] = useState<"issued" | "expires">("expires");
  const [items, setItems] = useState<Record[]>([]);
  const [searched, setSearched] = useState(false);

  function load() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (dateMonth.trim()) {
      params.set("dateMonth", dateMonth.trim());
      params.set("dateField", dateField);
    }
    fetch(`/api/shop/warranties?${params}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setItems(j.data);
        setSearched(true);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <ContextBanner role="shop" />
      <ShopTopBar title="Warranty records" subtitle="All issued warranties — including expired" />

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="alert-banner alert-banner-warning mb-4">
          <Archive className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm leading-snug">
            When a customer claims coverage, search their name or phone here. Expired warranties stay
            on record so you can show proof of expiry dates.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              className="input-field w-full py-2 pl-9 text-sm"
              placeholder="Customer, product, brand, phone, code"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <Button onClick={load}>Search</Button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <select
            className="input-field py-2 text-xs"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="PENDING_TRANSFER">Pending accept</option>
            <option value="REVOKED">Revoked</option>
          </select>
          <select
            className="input-field py-2 text-xs"
            value={dateField}
            onChange={(e) => setDateField(e.target.value as "issued" | "expires")}
          >
            <option value="expires">Filter by expiry month</option>
            <option value="issued">Filter by issue month</option>
          </select>
        </div>

        <input
          className="input-field mt-2 w-full py-2 text-xs"
          placeholder="Month: 2024-06, 06/2024, or June 2024"
          value={dateMonth}
          onChange={(e) => setDateMonth(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />

        <div className="activity-feed mt-6">
          {searched && items.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
              No warranties match. Try customer phone or product name.
            </div>
          ) : (
            items.map((w) => {
              const customer = w.buyer?.name ?? w.buyerName ?? "—";
              const phone = w.buyer?.phone ?? w.buyerPhone ?? "—";
              return (
                <div key={w.id} className="border-b border-[var(--border)] p-4 last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text-primary)]">{w.productName}</p>
                      {w.company?.brandName && (
                        <p className="text-xs text-[var(--accent)]">{w.company.brandName}</p>
                      )}
                      <p className="font-mono text-xs text-[var(--text-muted)]">{w.warrantyCode}</p>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">{customer}</p>
                      <p className="text-xs text-[var(--text-muted)]">{phone}</p>
                      <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                        Issued {formatDate(w.startDate)} · Expires {formatDate(w.endDate)}
                      </p>
                    </div>
                    <Badge variant={statusVariant(w.status)}>
                      {warrantyStatusLabel(w.status)}
                    </Badge>
                  </div>
                  {w.status === "EXPIRED" && (
                    <p className="mt-2 rounded-lg bg-slate-500/10 px-2 py-1 text-xs text-[var(--text-muted)]">
                      Expired — show customer these dates as proof. They can still view it in their
                      wallet under Expired.
                    </p>
                  )}
                  <Link
                    href={`/shop/verify?code=${encodeURIComponent(w.warrantyCode)}`}
                    className="mt-2 inline-block text-xs text-[var(--accent)] hover:underline"
                  >
                    Verify this warranty →
                  </Link>
                  <a
                    href={`/api/warranties/${w.id}/pdf`}
                    className="ml-3 mt-2 inline-block text-xs text-[var(--text-muted)] hover:underline"
                    download
                  >
                    PDF proof
                  </a>
                </div>
              );
            })
          )}
        </div>
      </main>

      <ShopBottomNav />
    </div>
  );
}
