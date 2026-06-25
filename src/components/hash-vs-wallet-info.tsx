import { Hash, Wallet } from "lucide-react";

/** Clarifies: app works without MetaMask; hash is automatic; wallet is optional. */
export function HashVsWalletInfo({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs leading-relaxed text-[var(--text-muted)]">
        <Hash className="mr-1 inline h-3.5 w-3.5 text-[var(--accent)]" />
        Every sale gets a unique SHA-256 hash automatically — no MetaMask needed to login or use the app.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm">
      <p className="font-medium text-[var(--text-primary)]">No MetaMask required</p>
      <ul className="mt-2 space-y-1.5 text-xs text-[var(--text-muted)]">
        <li>
          <Hash className="mr-1 inline h-3.5 w-3.5 text-[var(--accent)]" />
          <strong className="text-[var(--text-primary)]">Warranty hash</strong> — created when the shop
          seals a sale (price, terms, shop, your phone). Unique per product. Works without any crypto wallet.
        </li>
        <li>
          <Wallet className="mr-1 inline h-3.5 w-3.5 text-[var(--accent)]" />
          <strong className="text-[var(--text-primary)]">MetaMask (optional)</strong> — link in Profile
          only if you want to sign high-value or resale transfers on Polygon Amoy.
        </li>
      </ul>
    </div>
  );
}
