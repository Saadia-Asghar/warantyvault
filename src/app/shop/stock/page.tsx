"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShopBottomNav } from "@/components/shop-bottom-nav";
import { ContextBanner } from "@/components/context-banner";
import { ShopTopBar } from "@/components/shop-top-bar";
import { Button } from "@/components/ui/button";
import { Package, Truck } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Dispatch = {
  id: string;
  reference: string | null;
  createdAt: string;
  company: { brandName: string };
  items: Array<{ id: string; productName: string; serialImei: string | null }>;
};

type StockRow = {
  id: string;
  productName: string;
  category: string;
  serialImei: string | null;
  receivedAt: string;
};

export default function ShopStockPage() {
  const [pending, setPending] = useState<Dispatch[]>([]);
  const [inventory, setInventory] = useState<StockRow[]>([]);
  const [inStock, setInStock] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);

  function load() {
    fetch("/api/shop/stock")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setPending(j.data.pending ?? []);
          setInventory(j.data.inventory ?? []);
          setInStock(j.data.inStock ?? 0);
        }
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function receive(dispatchId: string) {
    setLoading(dispatchId);
    await fetch("/api/shop/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dispatchId }),
    });
    setLoading(null);
    load();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <ContextBanner role="shop" />
      <ShopTopBar title="Inventory" subtitle={`${inStock} units in stock`} />
      <main className="mx-auto max-w-lg px-4 py-6">
        {pending.length > 0 && (
          <>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
              <Truck className="h-4 w-4 text-[var(--accent)]" />
              Incoming from brand
            </h2>
            <div className="space-y-3">
              {pending.map((d) => (
                <div key={d.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <p className="font-medium text-[var(--text-primary)]">{d.company.brandName}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {d.items.length} units · {formatDate(d.createdAt)}
                    {d.reference ? ` · Ref ${d.reference}` : ""}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                    {d.items.slice(0, 4).map((i) => (
                      <li key={i.id}>
                        {i.productName}
                        {i.serialImei ? ` · ${i.serialImei}` : ""}
                      </li>
                    ))}
                    {d.items.length > 4 && (
                      <li className="text-xs">+{d.items.length - 4} more</li>
                    )}
                  </ul>
                  <Button
                    className="mt-3 w-full"
                    loading={loading === d.id}
                    onClick={() => void receive(d.id)}
                  >
                    Mark received
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="mb-3 mt-8 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <Package className="h-4 w-4 text-[var(--accent)]" />
          In stock
        </h2>
        {inventory.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No units in inventory. Ask your brand to dispatch stock, or record a sale manually.
          </p>
        ) : (
          <div className="activity-feed">
            {inventory.map((item) => (
              <div key={item.id} className="activity-row">
                <div className="activity-icon">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--text-primary)]">{item.productName}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {item.category}
                    {item.serialImei ? ` · ${item.serialImei}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/shop/issue" className="btn-primary mt-6 block w-full text-center">
          Record sale from stock
        </Link>
      </main>
      <ShopBottomNav />
    </div>
  );
}
