import { jsonOk } from "@/lib/api";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
  return jsonOk({ publicKey, enabled: Boolean(publicKey && process.env.VAPID_PRIVATE_KEY) });
}
