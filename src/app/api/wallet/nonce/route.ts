import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { createSiweLinkMessage, normalizeWalletAddress } from "@/lib/wallet";
import { z } from "zod";

const bodySchema = z.object({
  address: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "buyer" && session.role !== "shop")) {
      return jsonError("Unauthorized", 401);
    }

    const body = bodySchema.parse(await req.json());
    const address = normalizeWalletAddress(body.address);
    const result = await createSiweLinkMessage({ session, address });
    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
