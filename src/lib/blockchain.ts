import { prisma } from "@/lib/prisma";
import { generateTxHash } from "@/lib/hash";

export type ChainTxType = "REGISTER" | "TRANSFER" | "CLAIM" | "REVOKE";

export async function recordOnChain(
  warrantyHash: string,
  txType: ChainTxType,
  payload: Record<string, unknown>
): Promise<string> {
  const txHash = generateTxHash();

  await prisma.chainRecord.create({
    data: {
      warrantyHash,
      txType,
      txHash,
      payload: JSON.stringify(payload),
    },
  });

  return txHash;
}

export async function verifyOnChain(warrantyHash: string): Promise<{
  registered: boolean;
  transactions: Array<{
    txType: string;
    txHash: string;
    createdAt: Date;
  }>;
}> {
  const records = await prisma.chainRecord.findMany({
    where: { warrantyHash },
    orderBy: { createdAt: "asc" },
    select: { txType: true, txHash: true, createdAt: true },
  });

  return {
    registered: records.some((r) => r.txType === "REGISTER"),
    transactions: records,
  };
}

export function getExplorerUrl(txHash: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/verify/chain?tx=${txHash}`;
}
