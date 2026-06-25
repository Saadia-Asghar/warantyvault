import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getExplorerUrl, isRealPolygonTx } from "@/lib/blockchain";
import { ExternalLink } from "lucide-react";

export default async function ChainVerifyPage({
  searchParams,
}: {
  searchParams: { tx?: string };
}) {
  const tx = searchParams.tx;

  const record = tx
    ? await prisma.chainRecord.findUnique({ where: { txHash: tx } })
    : null;

  const explorerUrl = record
    ? getExplorerUrl(record.txHash, record.network)
    : tx
      ? getExplorerUrl(tx)
      : null;

  const isPolygon = record ? isRealPolygonTx(record.network) : false;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <Card>
          <CardTitle>On-chain registry record</CardTitle>
          <p className="mt-1 text-xs text-slate-400">
            {isPolygon
              ? "Anchored on Polygon Amoy — viewable on public block explorer"
              : "Local audit registry (set Polygon env vars for live testnet)"}
          </p>
          {!tx && (
            <p className="mt-4 text-sm text-slate-400">No transaction hash provided</p>
          )}
          {tx && !record && (
            <p className="mt-4 text-sm text-red-400">Transaction not found in registry</p>
          )}
          {record && (
            <div className="mt-4 space-y-3 font-mono text-xs">
              <p>
                <span className="text-slate-500">TX:</span>{" "}
                <span className="break-all text-sky-400">{record.txHash}</span>
              </p>
              <p>
                <span className="text-slate-500">Network:</span> {record.network}
              </p>
              <p>
                <span className="text-slate-500">Type:</span> {record.txType}
              </p>
              <p>
                <span className="text-slate-500">Warranty hash:</span>{" "}
                <span className="break-all text-slate-300">{record.warrantyHash}</span>
              </p>
              <p>
                <span className="text-slate-500">Time:</span>{" "}
                {formatDate(record.createdAt)}
              </p>
              {explorerUrl && isPolygon && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-sky-400 hover:underline"
                >
                  View on Polygonscan <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/30 p-3 text-[10px] text-slate-400">
                {JSON.stringify(JSON.parse(record.payload), null, 2)}
              </pre>
            </div>
          )}
          <Link href="/verify" className="btn-secondary mt-6 inline-flex text-sm">
            Verify warranty hash
          </Link>
        </Card>
      </main>
    </div>
  );
}
