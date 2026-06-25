import { NextRequest } from "next/server";
import { getSession, requireRole } from "@/lib/auth";
import { resaleTransferSchema } from "@/lib/validators";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { initiateResaleTransfer } from "@/lib/warranty-service";
import { prisma } from "@/lib/prisma";
import {
  resaleRequiresWalletSignature,
  RESALE_WALLET_SIGN_THRESHOLD_PKR,
  verifyResaleWalletSignature,
} from "@/lib/wallet";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!requireRole(session, "buyer")) return jsonError("Unauthorized", 401);

    const warranty = await prisma.warranty.findUnique({ where: { id: params.id } });
    if (!warranty) return jsonError("Not found", 404);
    if (warranty.buyerId !== session.sub) return jsonError("Not your warranty", 403);

    const body = await req.json();
    const data = resaleTransferSchema.parse(body);

    const buyer = await prisma.buyer.findUnique({ where: { id: session.sub } });
    const needsSig = resaleRequiresWalletSignature({
      walletAddress: buyer?.walletAddress,
      resaleAmount: data.resaleAmount,
    });

    if (needsSig) {
      if (!buyer?.walletAddress) {
        return jsonError(
          `Link MetaMask in Profile for transfers ≥ ₨${RESALE_WALLET_SIGN_THRESHOLD_PKR.toLocaleString("en-PK")}`,
          422,
          { wallet: "Go to Profile → Link wallet" }
        );
      }
      if (!data.walletSignature || !data.actionNonce) {
        return jsonError("MetaMask signature required to authorize this resale", 422, {
          walletSignature: "Sign the transfer in MetaMask",
        });
      }
      await verifyResaleWalletSignature({
        session,
        warrantyId: params.id,
        newBuyerPhone: data.newBuyerPhone,
        newBuyerName: data.newBuyerName,
        resaleAmount: data.resaleAmount,
        walletSignature: data.walletSignature,
        actionNonce: data.actionNonce,
      });
    }

    const updated = await initiateResaleTransfer(params.id, session.sub, {
      newBuyerPhone: data.newBuyerPhone,
      newBuyerName: data.newBuyerName,
      resaleAmount: data.resaleAmount,
    });

    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!requireRole(session, "buyer")) return jsonError("Unauthorized", 401);

    const { cancelResaleTransfer } = await import("@/lib/warranty-service");
    const updated = await cancelResaleTransfer(params.id, session.sub);
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
