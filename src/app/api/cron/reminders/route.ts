import { NextRequest } from "next/server";
import { runExpiryReminderJob } from "@/lib/reminder-jobs";
import { jsonError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return jsonError("Unauthorized", 401);
  }

  const result = await runExpiryReminderJob();
  return jsonOk(result);
}
