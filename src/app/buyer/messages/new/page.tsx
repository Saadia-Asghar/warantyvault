"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BuyerBottomNav } from "@/components/buyer-bottom-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ShopOption = {
  id: string;
  shopName: string;
  city: string;
  warrantyId?: string;
  warrantyCode?: string;
  productName?: string;
};

export default function NewBuyerMessagePage() {
  const router = useRouter();
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [shopId, setShopId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/threads/shops")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setShops(j.data.shops);
      });
  }, []);

  const selected = shops.find((s) => s.id === shopId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId,
          warrantyId: selected?.warrantyId,
          subject,
          message,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.push(`/buyer/messages/${json.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <header className="border-b border-[var(--border)] px-4 py-4">
        <Link href="/buyer/messages" className="text-xs text-[var(--accent)]">
          ← Messages
        </Link>
        <h1 className="mt-2 text-lg font-semibold">Contact a shop</h1>
        <p className="text-xs text-[var(--text-muted)]">
          Complaint, warranty question, or visit enquiry — shopkeeper can reply here
        </p>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-field">Shop</label>
            <select
              required
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select shop…</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName} — {s.city}
                  {s.warrantyCode ? ` (${s.warrantyCode})` : ""}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Warranty claim issue, wrong product…"
          />
          <div>
            <label className="label-field">Message</label>
            <textarea
              required
              minLength={5}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field w-full"
              placeholder="Describe your issue. The shopkeeper will reply in this chat."
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" loading={loading} className="w-full min-h-[48px]">
            Send to shop
          </Button>
        </form>
      </main>
      <BuyerBottomNav />
    </div>
  );
}
