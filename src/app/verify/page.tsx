"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, policyTypeLabel } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [hash, setHash] = useState(searchParams.get("hash") ?? "");
  const [result, setResult] = useState<{
    valid?: boolean;
    expired?: boolean;
    message?: string;
    warranty?: Record<string, string> | null;
    chain?: {
      mode?: string;
      polygonVerified?: boolean;
      transactions?: Array<{ txHash: string; explorerUrl: string; network: string }>;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyHash = useCallback(async (h?: string) => {
    const value = (h ?? hash).trim();
    if (value.length !== 64) return;
    setLoading(true);
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash: value }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) setResult(json.data);
  }, [hash]);

  useEffect(() => {
    const h = searchParams.get("hash");
    if (h && h.length === 64) {
      setHash(h);
      verifyHash(h);
    }
  }, [searchParams, verifyHash]);

  const valid = result?.valid as boolean;
  const expired = result?.expired as boolean;
  const warranty = result?.warranty as Record<string, string> | null;

  return (
    <Card>
      <CardTitle>Public warranty verification</CardTitle>
      <p className="mt-1 text-sm text-slate-400">
        Anyone can verify a warranty hash — no login required
      </p>

      <div className="mt-6 space-y-4">
        <Input
          label="Warranty hash"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          className="font-mono text-xs"
          placeholder="64-character SHA-256 hash"
        />
        <Button
          onClick={() => verifyHash()}
          loading={loading}
          className="w-full"
          disabled={hash.trim().length !== 64}
        >
          Verify
        </Button>
      </div>

      {result && (
        <div className="mt-6">
          <div
            className={`flex items-start gap-3 rounded-xl p-4 ${
              valid
                ? "border border-emerald-500/30 bg-emerald-500/10"
                : "border border-red-500/30 bg-red-500/10"
            }`}
          >
            {valid ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : expired ? (
              <AlertCircle className="h-5 w-5 text-amber-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
            <div>
              <p className="font-medium text-white">{result.message as string}</p>
              {warranty && (
                <div className="mt-3 space-y-1 text-sm text-slate-400">
                  <p>{warranty.productName}</p>
                  <p>{warranty.warrantyCode}</p>
                  <p>{policyTypeLabel(warranty.policyType)}</p>
                  <p>Until {formatDate(warranty.endDate)}</p>
                  {warranty.shopName && <p>Shop: {warranty.shopName}</p>}
                </div>
              )}
            </div>
          </div>
          <Badge variant={valid ? "active" : "expired"} className="mt-4">
            {valid ? "Registered on-chain" : "Not valid"}
          </Badge>
          {result.chain && (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-xs">
              <p className="font-medium text-[var(--text-primary)]">
                Blockchain:{" "}
                {result.chain.mode === "polygon_amoy"
                  ? "Polygon Amoy (live testnet)"
                  : "Local registry (configure Polygon for live anchoring)"}
              </p>
              {result.chain.polygonVerified && (
                <p className="mt-1 text-emerald-400">Verified on Polygon contract</p>
              )}
              {result.chain.transactions?.map((tx) => (
                <a
                  key={tx.txHash}
                  href={tx.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block truncate font-mono text-[var(--accent)] hover:underline"
                >
                  {tx.network === "polygon_amoy" ? "Polygon tx" : "Registry"} · {tx.txHash.slice(0, 18)}…
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <header className="border-b border-[var(--border)] px-4 py-3">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          ← Home
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Verify warranty</h1>
        <p className="text-xs text-[var(--text-muted)]">No login required</p>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8">
        <Suspense fallback={<p className="text-[var(--text-muted)]">Loading…</p>}>
          <VerifyContent />
        </Suspense>
      </main>
    </div>
  );
}
