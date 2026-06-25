import { getSession, requireRole } from "@/lib/auth";
import { getBuyerWalletData } from "@/lib/buyer-wallet-data";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { syncExpiredWarranties } from "@/lib/warranty-service";

export async function GET() {
  try {
    await syncExpiredWarranties();
    const session = await getSession();
    if (!requireRole(session, "buyer")) return jsonError("Unauthorized", 401);

    const data = await getBuyerWalletData(session);
    return jsonOk(data);
  } catch (error) {
    return handleApiError(error);
  }
}
