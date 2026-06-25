import { prisma } from "@/lib/prisma";
import { generateTxHash } from "@/lib/hash";
import {
  getChainMode,
  getPolygonExplorerTxUrl,
  isPolygonEnabled,
  submitToPolygon,
  verifyOnPolygon,
  type ChainMode,
} from "@/lib/polygon-chain";

export type ChainTxType = "REGISTER" | "TRANSFER" | "CLAIM" | "REVOKE";

export async function recordOnChain(
  warrantyHash: string,
  txType: ChainTxType,
  payload: Record<string, unknown>
): Promise<{ txHash: string; network: ChainMode }> {
  const network = getChainMode();
  let txHash: string;

  if (isPolygonEnabled()) {
    txHash = await submitToPolygon(warrantyHash, txType, payload);
  } else {
    txHash = generateTxHash();
  }

  await prisma.chainRecord.create({
    data: {
      warrantyHash,
      txType,
      txHash,
      network,
      payload: JSON.stringify(payload),
    },
  });

  return { txHash, network };
}

export async function verifyOnChain(warrantyHash: string): Promise<{
  mode: ChainMode;
  registered: boolean;
  polygonVerified: boolean;
  transactions: Array<{
    txType: string;
    txHash: string;
    network: string;
    createdAt: Date;
    explorerUrl: string;
  }>;
}> {
  const mode = getChainMode();
  const records = await prisma.chainRecord.findMany({
    where: { warrantyHash },
    orderBy: { createdAt: "asc" },
    select: { txType: true, txHash: true, network: true, createdAt: true },
  });

  const polygonVerified = mode === "polygon_amoy" ? await verifyOnPolygon(warrantyHash) : false;
  const dbRegistered = records.some((r) => r.txType === "REGISTER");

  return {
    mode,
    registered: dbRegistered || polygonVerified,
    polygonVerified,
    transactions: records.map((r) => ({
      ...r,
      explorerUrl:
        r.network === "polygon_amoy"
          ? getPolygonExplorerTxUrl(r.txHash)
          : getExplorerUrl(r.txHash),
    })),
  };
}

export function getExplorerUrl(txHash: string, network?: string): string {
  if (network === "polygon_amoy") {
    return getPolygonExplorerTxUrl(txHash);
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/verify/chain?tx=${txHash}`;
}

export function isRealPolygonTx(network: string | null | undefined): boolean {
  return network === "polygon_amoy";
}
