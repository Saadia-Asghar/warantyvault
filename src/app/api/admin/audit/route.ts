import { getSession, requireRole } from "@/lib/auth";
import { getAdminAuditLog } from "@/lib/audit";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, "admin")) return jsonError("Unauthorized", 401);

    const events = await getAdminAuditLog(200);
    return jsonOk(events);
  } catch (error) {
    return handleApiError(error);
  }
}
