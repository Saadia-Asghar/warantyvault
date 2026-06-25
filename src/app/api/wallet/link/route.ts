import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { verifyAndLinkWallet } from "@/lib/wallet";
import { z } from "zod";

const linkSchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "buyer" && session.role !== "shop")) {
      return jsonError("Unauthorized", 401);
    }

    const body = linkSchema.parse(await req.json());
    const result = await verifyAndLinkWallet({
      session,
      message: body.message,
      signature: body.signature,
    });
    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "buyer" && session.role !== "shop")) {
      return jsonError("Unauthorized", 401);
    }

    const { unlinkWallet } = await import("@/lib/wallet");
    await unlinkWallet(session);
    return jsonOk({ unlinked: true });
  } catch (error) {
    return handleApiError(error);
  }
}
