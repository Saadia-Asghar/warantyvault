import { NextRequest } from "next/server";
import { verifyHashSchema } from "@/lib/validators";
import { handleApiError, jsonOk } from "@/lib/api";
import { verifyWarrantyHash } from "@/lib/warranty-service";
import { verifyOnChain } from "@/lib/blockchain";
import { maskPhone } from "@/lib/hash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hash } = verifyHashSchema.parse(body);

    const result = await verifyWarrantyHash(hash);
    const chain = await verifyOnChain(hash);

    if (!result.warranty) {
      return jsonOk({
        valid: false,
        expired: false,
        revoked: false,
        tampered: false,
        registered: chain.registered,
        message: "Warranty not found in registry",
        warranty: null,
        chain,
      });
    }

    if (result.tampered) {
      return jsonOk({
        valid: false,
        expired: false,
        revoked: false,
        tampered: true,
        registered: chain.registered,
        message: "Integrity check failed — data may have been tampered with",
        warranty: null,
        chain,
      });
    }

    return jsonOk({
      valid: result.valid,
      expired: result.expired,
      revoked: result.revoked,
      tampered: false,
      registered: chain.registered,
      message: result.valid
        ? "Warranty is valid"
        : result.expired
          ? "Warranty has expired"
          : "Warranty is not valid",
      warranty: {
        warrantyCode: result.warranty.warrantyCode,
        productName: result.warranty.productName,
        policyType: result.warranty.policyType,
        status: result.warranty.status,
        startDate: result.warranty.startDate,
        endDate: result.warranty.endDate,
        termsEn: result.warranty.termsEn,
        shopName: result.warranty.shop?.shopName,
        purchaseCity: result.warranty.purchaseCity,
        purchaseSector: result.warranty.purchaseSector,
        brandName: result.warranty.company?.brandName ?? null,
        networkWarranty: !!result.warranty.companyId,
        buyerPhone: result.warranty.buyerPhone
          ? maskPhone(result.warranty.buyerPhone)
          : null,
      },
      chain,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
