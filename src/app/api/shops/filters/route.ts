import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Brands and cities for nearby map filters */
export async function GET() {
  const shops = await prisma.shop.findMany({
    where: {
      approvalStatus: "APPROVED",
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      city: true,
      company: { select: { brandName: true } },
    },
  });

  const brands = Array.from(
    new Set(shops.map((s) => s.company?.brandName).filter((b): b is string => Boolean(b)))
  ).sort();
  const cities = Array.from(new Set(shops.map((s) => s.city))).sort();

  return jsonOk({ brands, cities });
}
