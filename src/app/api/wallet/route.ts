import { getSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { getWalletForUser, type WalletRole } from "@/lib/wallet";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "buyer" && session.role !== "shop")) {
    return jsonError("Unauthorized", 401);
  }

  const row = await getWalletForUser(session.sub, session.role as WalletRole);
  return jsonOk({
    walletAddress: row?.walletAddress ?? null,
    walletLinkedAt: row?.walletLinkedAt?.toISOString() ?? null,
    role: session.role,
  });
}
