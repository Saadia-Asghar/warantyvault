"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, policyTypeLabel } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PolygonMetaMaskVerify } from "@/components/polygon-metamask-verify";
import { ChainLiveStatus } from "@/components/chain-live-status";
import { QrScanner, type ScanResult } from "@/components/qr-scanner";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [warrantyCode, setWarrantyCode] = useState(searchParams.get("code") ?? "");
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const runVerify = useCallback(async (opts: { hash?: string; warrantyCode?: string }) => {
    if (!opts.hash && !opts.warrantyCode) return;
    setLoading(true);
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) setResult(json.data);
    else setResult({ valid: false, message: json.error ?? "Verification failed" });
  }, []);

  useEffect(() => {
    const code = searchParams.get("code");
    const h = searchParams.get("hash");
    if (code) {
      setWarrantyCode(code);
      void runVerify({ warrantyCode: code });
    } else if (h && h.length === 64) {
      setHash(h);
      void runVerify({ hash: h });
    }
  }, [searchParams, runVerify]);

  function onScan(scan: ScanResult) {
    if (scan.type === "code") {
      setWarrantyCode(scan.value);
      void runVerify({ warrantyCode: scan.value });
    } else {
      setHash(scan.value);
      void runVerify({ hash: scan.value });
    }
  }

  const valid = result?.valid;
  const expired = result?.expired;
  const warranty = result?.warranty;

  return (
    <Card>
      <CardTitle>Verify warranty</CardTitle>
      <p className="mt-1 text-sm text-slate-400">
        Scan QR — no hash to remember. Works with camera or photo upload.
      </p>

      <div className="mt-6">
        <QrScanner onScan={onScan} label="Point at warranty QR from buyer wallet or shop receipt" />
      </div>

      <div className="mt-6 space-y-4">
        <Input
          label="Warranty code (e.g. WV-PK-2026-1001)"
          value={warrantyCode}
          onChange={(e) => setWarrantyCode(e.target.value.toUpperCase())}
          className="font-mono text-sm"
          placeholder="WV-PK-2026-1001"
        />
        <Button
          onClick={() => runVerify({ warrantyCode: warrantyCode.trim() })}
          loading={loading}
          className="w-full"
          disabled={warrantyCode.trim().length < 8}
        >
          Verify by code
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        Advanced: verify by hash
      </button>

      {showAdvanced && (
        <div className="mt-3 space-y-3">
          <Input
            label="Warranty hash (64 chars)"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="font-mono text-xs"
          />
          <Button
            variant="secondary"
            onClick={() => runVerify({ hash: hash.trim() })}
            loading={loading}
            className="w-full"
            disabled={hash.trim().length !== 64}
          >
            Verify hash
          </Button>
        </div>
      )}

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
              <p className="font-medium text-white">{result.message}</p>
              {warranty && (
                <div className="mt-3 space-y-1 text-sm text-slate-400">
                  <p className="font-mono text-[var(--accent)]">{warranty.warrantyCode}</p>
                  <p>{warranty.productName}</p>
                  <p>{policyTypeLabel(warranty.policyType)}</p>
                  <p>Until {formatDate(warranty.endDate)}</p>
                  {warranty.shopName && <p>Shop: {warranty.shopName}</p>}
                  {warranty.brandName && <p>Brand: {warranty.brandName}</p>}
                </div>
              )}
            </div>
          </div>
          <Badge variant={valid ? "active" : "expired"} className="mt-4">
            {valid ? "Valid warranty" : "Not valid"}
          </Badge>
          {result.chain && (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-xs">
              <p className="font-medium text-[var(--text-primary)]">
                Blockchain:{" "}
                {result.chain.mode === "polygon_amoy"
                  ? "Polygon Amoy (live testnet)"
                  : "Audit registry (SHA-256)"}
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
          <PolygonMetaMaskVerify
            warrantyHash={
              hash.length === 64 ? hash : undefined
            }
          />
        </div>
      )}
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-8">
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Verify warranty</h1>
        <p className="text-xs text-[var(--text-muted)]">Scan QR or enter short warranty code</p>
        <div className="mt-4">
          <ChainLiveStatus />
        </div>
        <Suspense fallback={<p className="text-[var(--text-muted)]">Loading…</p>}>
          <VerifyContent />
        </Suspense>
      </main>
    </div>
  );
}
