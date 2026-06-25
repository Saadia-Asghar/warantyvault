import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import {
  createResaleActionChallenge,
  resaleRequiresWalletSignature,
  RESALE_WALLET_SIGN_THRESHOLD_PKR,
} from "@/lib/wallet";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const challengeSchema = z.object({
  warrantyId: z.string().min(1),
  newBuyerPhone: z.string().min(10).max(15),
  newBuyerName: z.string().min(2).max(100),
  resaleAmount: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, "buyer")) return jsonError("Unauthorized", 401);

    const body = challengeSchema.parse(await req.json());
    const buyer = await prisma.buyer.findUnique({ where: { id: session.sub } });

    const required = resaleRequiresWalletSignature({
      walletAddress: buyer?.walletAddress,
      resaleAmount: body.resaleAmount,
    });

    if (!required) {
      return jsonOk({
        required: false,
        thresholdPkr: RESALE_WALLET_SIGN_THRESHOLD_PKR,
      });
    }

    if (!buyer?.walletAddress) {
      return jsonError(
        `Link MetaMask in Profile for transfers ≥ ₨${RESALE_WALLET_SIGN_THRESHOLD_PKR.toLocaleString("en-PK")}`,
        422
      );
    }

    const challenge = await createResaleActionChallenge({
      session,
      warrantyId: body.warrantyId,
      newBuyerPhone: body.newBuyerPhone,
      newBuyerName: body.newBuyerName,
      resaleAmount: body.resaleAmount,
    });

    return jsonOk({
      required: true,
      ...challenge,
      thresholdPkr: RESALE_WALLET_SIGN_THRESHOLD_PKR,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
