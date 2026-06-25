"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { ExternalLink, Wallet } from "lucide-react";
import { WARRANTY_REGISTRY_ABI } from "@/lib/contracts/warranty-registry-abi";
import { POLYGON_AMOY, getRegistryAddress } from "@/lib/polygon-config";

type Props = {
  warrantyHash?: string;
};

export function PolygonMetaMaskVerify({ warrantyHash }: Props) {
  const contractAddress = getRegistryAddress();
  const [account, setAccount] = useState<string | null>(null);
  const [onChain, setOnChain] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ensureAmoyNetwork(provider: ethers.BrowserProvider) {
    const chainId = await provider.send("eth_chainId", []);
    if (chainId === POLYGON_AMOY.chainIdHex) return;
    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: POLYGON_AMOY.chainIdHex },
      ]);
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code;
      if (code === 4902) {
        await provider.send("wallet_addEthereumChain", [POLYGON_AMOY]);
      } else {
        throw err;
      }
    }
  }

  async function connectAndVerify() {
    if (!contractAddress) {
      setError("Polygon contract not deployed yet. Run npm run setup:polygon");
      return;
    }
    if (!warrantyHash || warrantyHash.length !== 64) {
      setError("Enter a valid 64-character warranty hash first");
      return;
    }
    if (!window.ethereum) {
      setError("Install MetaMask to verify on Polygon Amoy");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await ensureAmoyNetwork(provider);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0] as string);
      const contract = new ethers.Contract(
        contractAddress,
        WARRANTY_REGISTRY_ABI,
        provider
      );
      const registered = await contract.checkRegistered(`0x${warrantyHash}`);
      setOnChain(Boolean(registered));
    } catch (e) {
      setError(e instanceof Error ? e.message : "MetaMask verification failed");
      setOnChain(null);
    } finally {
      setLoading(false);
    }
  }

  if (!contractAddress) {
    return (
      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
        Polygon Amoy not configured on this deployment. Server-side registry still works.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-[var(--accent)]" />
        <p className="text-sm font-medium text-[var(--text-primary)]">
          Verify on Polygon with MetaMask
        </p>
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Read-only check against the public WarrantyRegistry contract on Amoy testnet.
      </p>
      <button
        type="button"
        onClick={() => void connectAndVerify()}
        disabled={loading || !warrantyHash}
        className="btn-secondary mt-3 w-full text-sm disabled:opacity-50"
      >
        {loading ? "Checking chain…" : account ? "Re-check on chain" : "Connect MetaMask & verify"}
      </button>
      {account && (
        <p className="mt-2 truncate font-mono text-[10px] text-[var(--text-tertiary)]">
          {account}
        </p>
      )}
      {onChain === true && (
        <p className="mt-2 text-sm text-emerald-400">Registered on Polygon Amoy contract</p>
      )}
      {onChain === false && (
        <p className="mt-2 text-sm text-red-400">Not found on Polygon contract</p>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <a
        href={POLYGON_AMOY.blockExplorerUrls[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
      >
        Polygonscan Amoy <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}
