import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessWarranty } from "@/lib/warranty-access";
import { buildWarrantyPdf } from "@/lib/warranty-pdf";
import { appBaseUrl } from "@/lib/sms";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  const warranty = await prisma.warranty.findUnique({
    where: { id: params.id },
    include: {
      shop: { select: { shopName: true, city: true, phone: true, sector: true } },
      company: { select: { brandName: true } },
      buyer: { select: { name: true, phone: true } },
    },
  });

  if (!warranty) {
    return new Response("Not found", { status: 404 });
  }

  if (!canAccessWarranty(session, warranty)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const verifyUrl = `${appBaseUrl()}/verify?code=${encodeURIComponent(warranty.warrantyCode)}`;
  const pdf = await buildWarrantyPdf(warranty, verifyUrl);
  const filename = `warranty-${warranty.warrantyCode.replace(/[^a-zA-Z0-9-]/g, "")}.pdf`;

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
