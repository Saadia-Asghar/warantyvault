"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";

export function ChainLiveStatus() {
  const [status, setStatus] = useState<{
    mode: string;
    polygonConfigured: boolean;
    contract: string | null;
    onChainTransactions: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setStatus(j.data.blockchain);
      })
      .catch(() => {});
  }, []);

  if (!status) return null;

  const live = status.mode === "polygon_amoy" && status.polygonConfigured;

  return (
    <div
      className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-xs ${
        live
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)]"
      }`}
    >
      <Link2 className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium text-[var(--text-primary)]">
          {live ? "Polygon Amoy — live on-chain anchoring" : "Hashes — SHA-256 audit registry (DB)"}
        </p>
        <p className="mt-0.5">
          {live
            ? `${status.onChainTransactions} on-chain tx · contract ${status.contract?.slice(0, 10)}…`
            : "Warranty hashes are cryptographically verified. Run npm run setup:polygon + fund wallet for public chain."}
        </p>
      </div>
    </div>
  );
}
