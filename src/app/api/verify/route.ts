import { NextRequest } from "next/server";
import { verifyInputSchema } from "@/lib/validators";
import { handleApiError, jsonOk } from "@/lib/api";
import { verifyWarranty } from "@/lib/warranty-service";
import { verifyOnChain } from "@/lib/blockchain";
import { maskPhone } from "@/lib/hash";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`verify:${ip}`, 90, 60_000)) {
      return Response.json(
        { success: false, error: "Too many verification requests. Wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const input = verifyInputSchema.parse(body);

    const result = await verifyWarranty({
      hash: input.hash,
      warrantyCode: input.warrantyCode,
    });

    const warrantyHash =
      input.hash ??
      result.warranty?.warrantyHash ??
      undefined;

    const chainFull = warrantyHash
      ? await verifyOnChain(warrantyHash)
      : {
          mode: "local" as const,
          registered: false,
          polygonVerified: false,
          transactions: [] as Array<{
            txType: string;
            txHash: string;
            network: string;
            createdAt: Date;
            explorerUrl: string;
          }>,
        };

    if (!result.warranty) {
      return jsonOk({
        valid: false,
        expired: false,
        revoked: false,
        tampered: false,
        registered: chainFull.registered,
        message: input.warrantyCode
          ? "Warranty code not found"
          : "Warranty not found in registry",
        warranty: null,
        chain: chainFull,
      });
    }

    if (result.tampered) {
      return jsonOk({
        valid: false,
        expired: false,
        revoked: false,
        tampered: true,
        registered: chainFull.registered,
        message: "Integrity check failed — data may have been tampered with",
        warranty: null,
        chain: chainFull,
      });
    }

    return jsonOk({
      valid: result.valid,
      expired: result.expired,
      revoked: result.revoked,
      tampered: false,
      registered: chainFull.registered,
      message: result.valid
        ? "Warranty is valid"
        : result.expired
          ? "Warranty has expired"
          : result.revoked
            ? "Warranty was revoked"
            : "Warranty is not valid",
      warranty: {
        warrantyCode: result.warranty.warrantyCode,
        warrantyHash: result.warranty.warrantyHash,
        productName: result.warranty.productName,
        policyType: result.warranty.policyType,
        status: result.warranty.status,
        startDate: result.warranty.startDate,
        endDate: result.warranty.endDate,
        termsEn: result.warranty.termsEn,
        shopName: result.warranty.shop?.shopName,
        purchaseCity: result.warranty.purchaseCity,
        purchaseSector: result.warranty.purchaseSector,
        purchaseAmount: result.warranty.purchaseAmount,
        paymentMethod: result.warranty.paymentMethod,
        paperPhotoSealed: !!result.warranty.paperPhotoHash,
        brandName: result.warranty.company?.brandName ?? null,
        networkWarranty: !!result.warranty.companyId,
        buyerPhone: result.warranty.buyerPhone
          ? maskPhone(result.warranty.buyerPhone)
          : null,
      },
      chain: chainFull,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
