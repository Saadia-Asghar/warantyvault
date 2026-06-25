import { jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/** Public list of brands outlets can apply to join */
export async function GET() {
  const companies = await prisma.company.findMany({
    select: { id: true, brandName: true, legalName: true },
    orderBy: { brandName: "asc" },
  });
  return jsonOk(companies);
}
