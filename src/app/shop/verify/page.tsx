"use client";

import { useState } from "react";
import { ShopBottomNav } from "@/components/shop-bottom-nav";
import { ContextBanner } from "@/components/context-banner";
import { ShopTopBar } from "@/components/shop-top-bar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrScanner } from "@/components/qr-scanner";
import { parseWarrantyHashFromScan } from "@/lib/qr-utils";
import { formatDate, policyTypeLabel } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type VerifyResult = {
  valid: boolean;
  expired: boolean;
  revoked: boolean;
  message: string;
  warranty: {
    warrantyCode: string;
    productName: string;
    policyType: string;
    status: string;
    startDate: string;
    endDate: string;
    termsEn: string;
    shopName?: string;
    brandName?: string | null;
    purchaseSector?: string | null;
    networkWarranty?: boolean;
  } | null;
};

export default function ShopVerifyPage() {
  const [hash, setHash] = useState("");
  const [issue, setIssue] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verify() {
    setLoading(true);
    setError("");
    setResult(null);
    setClaimId(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: hash.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setResult(json.data);
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function openClaim() {
    if (!issue.trim()) {
      setError("Describe the issue");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warrantyHash: hash.trim(), issueDescription: issue }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setClaimId(json.data.id);
    } catch {
      setError("Failed to open claim");
    } finally {
      setLoading(false);
    }
  }

  async function updateClaim(status: string) {
    if (!claimId) return;
    setLoading(true);
    const res = await fetch("/api/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId, status }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setClaimId(null);
      setIssue("");
      alert(`Claim marked as ${status}`);
    } else {
      setError(json.error);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <ContextBanner role="shop" />
      <ShopTopBar title="Verify & claim" subtitle="Scan buyer QR or paste hash" />
      <main className="mx-auto max-w-lg px-4 py-6">
        <Card>
          <div className="mt-6 space-y-4">
            <QrScanner
              onScan={(value) => {
                setHash(parseWarrantyHashFromScan(value));
                setError("");
              }}
            />
            <Input
              label="Warranty hash (64 chars)"
              value={hash}
              onChange={(e) => setHash(parseWarrantyHashFromScan(e.target.value))}
              placeholder="Paste SHA-256 hash from buyer app"
              className="font-mono text-xs"
            />
            <Button onClick={verify} loading={loading} className="w-full">
              Verify warranty
            </Button>
          </div>

          {result && (
            <div className="mt-6 space-y-4">
              <div
                className={`flex items-start gap-3 rounded-xl p-4 ${
                  result.valid
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                {result.valid ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                ) : result.expired ? (
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                )}
                <div>
                  <p className="font-medium text-white">{result.message}</p>
                  {result.warranty && (
                    <p className="mt-1 text-sm text-slate-400">
                      {result.warranty.productName} · {result.warranty.warrantyCode}
                    </p>
                  )}
                </div>
              </div>

              {result.warranty && (
                <div className="rounded-xl bg-white/5 p-4 text-sm space-y-2">
                  <p>
                    <span className="text-slate-500">Policy:</span>{" "}
                    {policyTypeLabel(result.warranty.policyType)}
                  </p>
                  {result.warranty.brandName && (
                    <p>
                      <span className="text-slate-500">Brand network:</span>{" "}
                      {result.warranty.brandName}
                      {result.warranty.networkWarranty && (
                        <span className="ml-2 text-emerald-400">· Cross-outlet claim OK</span>
                      )}
                    </p>
                  )}
                  {result.warranty.purchaseSector && (
                    <p>
                      <span className="text-slate-500">Purchased at:</span>{" "}
                      {result.warranty.purchaseSector}
                    </p>
                  )}
                  <p>
                    <span className="text-slate-500">Valid until:</span>{" "}
                    {formatDate(result.warranty.endDate)}
                  </p>
                  <p className="text-slate-400">{result.warranty.termsEn}</p>
                </div>
              )}

              {result.valid && !claimId && (
                <>
                  <Textarea
                    label="Issue description"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Screen not working, fan noise..."
                  />
                  <Button onClick={openClaim} loading={loading} className="w-full">
                    Open claim
                  </Button>
                </>
              )}

              {claimId && (
                <div className="space-y-2">
                  <Badge variant="pending">Claim opened</Badge>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => updateClaim("IN_REPAIR")}>
                      In repair
                    </Button>
                    <Button onClick={() => updateClaim("COMPLETED")}>
                      Completed
                    </Button>
                    <Button onClick={() => updateClaim("EXCHANGED")}>
                      Exchanged
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </Card>
      </main>
      <ShopBottomNav />
    </div>
  );
}
