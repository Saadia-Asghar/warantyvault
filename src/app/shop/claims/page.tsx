"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShopBottomNav } from "@/components/shop-bottom-nav";
import { ShopTopBar } from "@/components/shop-top-bar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

type Claim = {
  id: string;
  status: string;
  openedAt: string;
  warranty: {
    id: string;
    productName: string;
    warrantyCode: string;
    warrantyHash: string;
    buyerName: string | null;
    buyerPhone: string | null;
  };
};

export default function ShopClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    fetch("/api/claims")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setClaims(j.data);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(claimId: string, status: string, rejectionReason?: string) {
    setLoading(claimId);
    await fetch("/api/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId, status, rejectionReason }),
    });
    setLoading(null);
    setRejectId(null);
    setRejectReason("");
    load();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <ShopTopBar title="Open claims" subtitle="Claims you're processing" />
      <main className="mx-auto max-w-lg px-4 py-6">
        {claims.length === 0 ? (
          <div className="panel px-4 py-12 text-center text-sm text-[var(--text-muted)]">
            No open claims — scan a warranty QR on Verify to open one.
          </div>
        ) : (
          <div className="activity-feed">
            {claims.map((c) => (
              <div key={c.id} className="border-b border-[var(--border)] p-4 last:border-b-0">
                <p className="font-medium text-[var(--text-primary)]">{c.warranty.productName}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {c.warranty.warrantyCode} · {formatDate(c.openedAt)}
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Status: {c.status}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.status === "OPENED" && (
                    <Button
                      loading={loading === c.id}
                      onClick={() => void updateStatus(c.id, "IN_REPAIR")}
                    >
                      In repair
                    </Button>
                  )}
                  {["OPENED", "IN_REPAIR"].includes(c.status) && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => void updateStatus(c.id, "COMPLETED")}
                      >
                        Completed
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void updateStatus(c.id, "EXCHANGED")}
                      >
                        Exchanged
                      </Button>
                      <Button variant="danger" onClick={() => setRejectId(c.id)}>
                        Reject
                      </Button>
                    </>
                  )}
                  <Link href="/shop/verify" className="btn-ghost text-xs">
                    Verify
                  </Link>
                </div>
                {rejectId === c.id && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      label="Rejection reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <Button
                      variant="danger"
                      onClick={() => void updateStatus(c.id, "REJECTED", rejectReason)}
                    >
                      Confirm reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <ShopBottomNav />
    </div>
  );
}
