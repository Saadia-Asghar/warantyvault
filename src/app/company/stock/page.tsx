"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ContextBanner } from "@/components/context-banner";
import { CompanyBottomNav } from "@/components/company-bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Truck } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Outlet = { id: string; shopName: string; city: string; sector: string | null };

type Dispatch = {
  id: string;
  reference: string | null;
  status: string;
  createdAt: string;
  shop: { shopName: string; city: string };
  items: Array<{ productName: string; status?: string }>;
};

export default function CompanyStockPage() {
  const [brandName, setBrandName] = useState("Brand HQ");
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [stats, setStats] = useState({ inStock: 0, sold: 0 });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    shopId: "",
    reference: "",
    productName: "",
    category: "MOBILE",
    serialImei: "",
    quantity: "1",
  });

  function load() {
    fetch("/api/company/stock")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setDispatches(j.data.dispatches ?? []);
          setStats(j.data.stockStats ?? { inStock: 0, sold: 0 });
        }
      });
    fetch("/api/company/outlets")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setOutlets(
            (j.data.outlets ?? []).filter((o: Outlet & { approvalStatus: string }) => o.approvalStatus === "APPROVED")
          );
        }
      });
  }

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data?.session?.name) setBrandName(j.data.session.name);
      });
    load();
  }, []);

  async function dispatch() {
    setLoading(true);
    setError("");
    const qty = Math.min(20, Math.max(1, parseInt(form.quantity) || 1));
    const items = Array.from({ length: qty }, (_, i) => ({
      productName: form.productName,
      category: form.category as "MOBILE" | "APPLIANCE" | "GENERAL",
      serialImei: qty === 1 ? form.serialImei || undefined : `${form.serialImei || "UNIT"}-${i + 1}`,
    }));
    const res = await fetch("/api/company/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopId: form.shopId,
        reference: form.reference || undefined,
        items,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error ?? "Dispatch failed");
      return;
    }
    setShowForm(false);
    setForm({ ...form, productName: "", serialImei: "", reference: "" });
    load();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <Navbar role="company" name={brandName} />
      <ContextBanner role="company" />
      <main className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl">
        <div className="summary-card">
          <p className="text-sm text-[var(--text-muted)]">Network inventory</p>
          <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{stats.inStock}</p>
          <p className="mt-2 text-sm text-[var(--accent)]">{stats.sold} sold through outlets</p>
        </div>

        <Button className="mt-6 w-full" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Dispatch stock to outlet
        </Button>

        {showForm && (
          <div className="mt-4 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <div>
              <label className="label-field">Outlet</label>
              <select
                className="input-field"
                value={form.shopId}
                onChange={(e) => setForm({ ...form, shopId: e.target.value })}
              >
                <option value="">Select outlet</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.shopName} · {o.sector ?? o.city}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Dispatch reference (optional)"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
            <Input
              label="Product name"
              required
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
            />
            <Input
              label="Serial / IMEI (optional)"
              value={form.serialImei}
              onChange={(e) => setForm({ ...form, serialImei: e.target.value })}
            />
            <Input
              label="Quantity"
              type="number"
              min="1"
              max="20"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              className="w-full"
              loading={loading}
              disabled={!form.shopId || !form.productName}
              onClick={() => void dispatch()}
            >
              Send dispatch
            </Button>
          </div>
        )}

        <h2 className="mb-3 mt-8 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <Truck className="h-4 w-4" />
          Recent dispatches
        </h2>
        {dispatches.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No dispatches yet.</p>
        ) : (
          <div className="space-y-3">
            {dispatches.map((d) => (
              <div key={d.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{d.shop.shopName}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {d.items.length} units · {formatDate(d.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.status === "RECEIVED"
                        ? "bg-[var(--pastel-mint)] text-[var(--accent)]"
                        : "bg-[var(--pastel-sky)] text-blue-700"
                    }`}
                  >
                    {d.status === "RECEIVED" ? "Received" : "Pending"}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                  {d.items.slice(0, 3).map((i, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5" />
                      {i.productName}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
      <CompanyBottomNav />
    </div>
  );
}
