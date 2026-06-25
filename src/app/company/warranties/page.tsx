"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyBottomNav } from "@/components/company-bottom-nav";
import { Navbar } from "@/components/navbar";
import { NotificationPanel } from "@/components/notification-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, warrantyStatusLabel } from "@/lib/utils";
import { Download, Search } from "lucide-react";

type Warranty = {
  id: string;
  warrantyCode: string;
  productName: string;
  status: string;
  buyerPhone: string | null;
  buyerName: string | null;
  serialImei: string | null;
  createdAt: string;
  endDate: string;
  shop: { shopName: string; city: string; sector: string | null };
  buyer: { name: string; phone: string } | null;
};

export default function CompanyWarrantiesPage() {
  const [items, setItems] = useState<Warranty[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [dateMonth, setDateMonth] = useState("");
  const [dateField, setDateField] = useState<"issued" | "expires">("expires");
  const [loading, setLoading] = useState<string | null>(null);

  function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (dateMonth.trim()) {
      params.set("dateMonth", dateMonth.trim());
      params.set("dateField", dateField);
    }
    fetch(`/api/company/warranties?${params}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setItems(j.data);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function revoke(id: string) {
    const reason = window.prompt("Reason for revoking this warranty?");
    if (!reason?.trim()) return;
    setLoading(id);
    await fetch(`/api/warranties/${id}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setLoading(null);
    load();
  }

  function exportCsv() {
    const header = "code,product,status,shop,city,buyer,phone,expires";
    const rows = items.map((w) =>
      [
        w.warrantyCode,
        w.productName,
        w.status,
        w.shop.shopName,
        w.shop.city,
        w.buyerName ?? "",
        w.buyerPhone ?? "",
        w.endDate,
      ].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "network-warranties.csv";
    a.click();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <Navbar role="company" name="Warranties" />
      <div className="border-b border-[var(--border)] px-4 py-2">
        <div className="mx-auto flex max-w-lg justify-end md:max-w-2xl">
          <NotificationPanel />
        </div>
      </div>
      <main className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              className="input-field w-full py-2 pl-9 text-sm"
              placeholder="Customer, product, brand, phone, code, IMEI"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <Button onClick={load}>Go</Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            className="input-field max-w-[160px] py-2 text-xs"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="PENDING_TRANSFER">Pending</option>
            <option value="REVOKED">Revoked</option>
          </select>
          <select
            className="input-field max-w-[160px] py-2 text-xs"
            value={dateField}
            onChange={(e) => setDateField(e.target.value as "issued" | "expires")}
          >
            <option value="expires">Expiry month</option>
            <option value="issued">Issue month</option>
          </select>
          <input
            className="input-field max-w-[140px] py-2 text-xs"
            placeholder="e.g. 2024-06"
            value={dateMonth}
            onChange={(e) => setDateMonth(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <button type="button" onClick={exportCsv} className="btn-ghost text-xs">
            <Download className="mr-1 inline h-3 w-3" /> Export CSV
          </button>
          <Link href="/company/fraud" className="btn-ghost text-xs">
            Fraud flags →
          </Link>
        </div>

        <div className="activity-feed mt-6">
          {items.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
              No warranties match your search.
            </div>
          ) : (
            items.map((w) => (
              <div key={w.id} className="border-b border-[var(--border)] p-4 last:border-b-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{w.productName}</p>
                    <p className="font-mono text-xs text-[var(--text-muted)]">{w.warrantyCode}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {w.shop.shopName} · {w.shop.sector ? `${w.shop.sector}, ` : ""}
                      {w.shop.city}
                    </p>
                    {w.buyer && (
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {w.buyer.name} · {w.buyer.phone}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Issued {formatDate(w.createdAt)} · Expires {formatDate(w.endDate)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      w.status === "ACTIVE"
                        ? "active"
                        : w.status === "EXPIRED"
                          ? "expired"
                          : "pending"
                    }
                  >
                    {warrantyStatusLabel(w.status)}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <a
                    href={`/api/warranties/${w.id}/pdf`}
                    className="text-xs text-[var(--accent)] hover:underline"
                    download
                  >
                    PDF proof
                  </a>
                  {w.status !== "REVOKED" && w.status !== "EXPIRED" && (
                  <Button
                    variant="danger"
                    className="btn-primary-sm mt-3"
                    loading={loading === w.id}
                    onClick={() => void revoke(w.id)}
                  >
                    Revoke
                  </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <CompanyBottomNav />
    </div>
  );
}
