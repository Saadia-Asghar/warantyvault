import { jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  getChainMode,
  getPolygonWalletBalance,
  isPolygonEnabled,
} from "@/lib/polygon-chain";

export const dynamic = "force-dynamic";

export async function GET() {
  const mode = getChainMode();
  const polygonEnabled = isPolygonEnabled();
  const walletBalance = polygonEnabled ? await getPolygonWalletBalance() : null;

  const [shops, warranties, chainRecords, locatedShops] = await Promise.all([
    prisma.shop.count({ where: { approvalStatus: "APPROVED" } }),
    prisma.warranty.count(),
    prisma.chainRecord.count(),
    prisma.shop.count({
      where: { approvalStatus: "APPROVED", latitude: { not: null } },
    }),
  ]);

  const polygonTxCount = await prisma.chainRecord.count({
    where: { network: "polygon_amoy" },
  });

  return jsonOk({
    status: "ok",
    timestamp: new Date().toISOString(),
    blockchain: {
      mode,
      polygonConfigured: polygonEnabled,
      contract: process.env.WARRANTY_REGISTRY_CONTRACT ?? null,
      explorer: process.env.NEXT_PUBLIC_POLYGON_EXPLORER ?? "https://amoy.polygonscan.com",
      walletBalanceMatic: walletBalance,
      onChainTransactions: polygonTxCount,
      note:
        mode === "polygon_amoy"
          ? "Warranty hashes are anchored on Polygon Amoy testnet"
          : "Set POLYGON_RPC_URL, POLYGON_PRIVATE_KEY, WARRANTY_REGISTRY_CONTRACT for live chain",
    },
    data: {
      approvedShops: shops,
      shopsWithLocation: locatedShops,
      warranties,
      chainRecords,
    },
  });
}
