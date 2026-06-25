"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Unlink, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectWalletAddress, shortenAddress, signWalletMessage } from "@/lib/metamask-client";
import { POLYGON_AMOY } from "@/lib/polygon-config";

type WalletState = {
  walletAddress: string | null;
  walletLinkedAt: string | null;
};

export function WalletLinkCard({ highlight }: { highlight?: boolean }) {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setWallet({
            walletAddress: j.data.walletAddress,
            walletLinkedAt: j.data.walletLinkedAt,
          });
        }
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function linkWallet() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const address = await connectWalletAddress();
      const nonceRes = await fetch("/api/wallet/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const nonceJson = await nonceRes.json();
      if (!nonceJson.success) {
        setError(nonceJson.error ?? "Could not start wallet link");
        return;
      }

      const signature = await signWalletMessage(nonceJson.data.message);
      const linkRes = await fetch("/api/wallet/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: nonceJson.data.message,
          signature,
        }),
      });
      const linkJson = await linkRes.json();
      if (!linkJson.success) {
        setError(linkJson.error ?? "Link failed");
        return;
      }

      setMessage("Wallet linked — resale transfers can be signed with MetaMask.");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "MetaMask link failed");
    } finally {
      setLoading(false);
    }
  }

  async function unlinkWallet() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/wallet/link", { method: "DELETE" });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setMessage("Wallet unlinked");
      load();
    } else {
      setError(json.error ?? "Could not unlink");
    }
  }

  return (
    <section className={`panel p-4 ${highlight ? "ring-2 ring-[var(--accent)]/40" : ""}`}>
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Blockchain wallet</h2>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
        Optional — link MetaMask on Polygon Amoy. Your phone/email login stays the same. Linked wallets
        must sign high-value or resale transfers.
      </p>

      {wallet?.walletAddress ? (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3">
          <p className="text-xs text-[var(--text-tertiary)]">Linked wallet</p>
          <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">
            {shortenAddress(wallet.walletAddress)}
          </p>
          {wallet.walletLinkedAt && (
            <p className="mt-1 text-[10px] text-[var(--text-tertiary)]">
              Since {new Date(wallet.walletLinkedAt).toLocaleDateString("en-PK")}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`${POLYGON_AMOY.blockExplorerUrls[0]}/address/${wallet.walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex text-xs"
            >
              View on Polygonscan <ExternalLink className="h-3 w-3" />
            </a>
            <Button variant="secondary" loading={loading} onClick={() => void unlinkWallet()}>
              <Unlink className="h-4 w-4" /> Unlink
            </Button>
          </div>
        </div>
      ) : (
        <Button className="mt-4 w-full" loading={loading} onClick={() => void linkWallet()}>
          <Wallet className="h-4 w-4" /> Link MetaMask wallet
        </Button>
      )}

      {message && <p className="mt-2 text-xs text-[var(--accent)]">{message}</p>}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </section>
  );
}
