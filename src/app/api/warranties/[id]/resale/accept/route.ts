import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { acceptResaleTransfer } from "@/lib/warranty-service";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!requireRole(session, "buyer")) return jsonError("Unauthorized", 401);

    const accepted = await acceptResaleTransfer(params.id, session.sub);
    return jsonOk(accepted);
  } catch (error) {
    return handleApiError(error);
  }
}
