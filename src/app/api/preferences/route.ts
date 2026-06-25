import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getPreferences, setPreference } from "@/lib/preferences";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const prefs = await getPreferences(session.sub, session.role);
    return jsonOk(prefs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { key, value } = await req.json();
    if (!key || value === undefined) return jsonError("key and value required", 400);

    await setPreference(session.sub, session.role, key, String(value));
    return jsonOk({ key, value: String(value) });
  } catch (error) {
    return handleApiError(error);
  }
}
