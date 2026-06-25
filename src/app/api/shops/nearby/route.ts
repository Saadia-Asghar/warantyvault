import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonOk } from "@/lib/api";
import { haversineKm } from "@/lib/geo";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(500).default(75),
  category: z.string().optional(),
  brand: z.string().optional(),
  city: z.string().optional(),
  q: z.string().optional(),
});

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`nearby:${ip}`, 180, 60_000)) {
      return Response.json(
        { success: false, error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { lat, lng, radiusKm, category, brand, city, q } = querySchema.parse(params);

    const cacheKey = `nearby:${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusKm}:${brand ?? ""}:${city ?? ""}:${q ?? ""}`;
    const cached = cacheGet<ReturnType<typeof buildPayload>>(cacheKey);
    if (cached) {
      return jsonOk(cached);
    }

    const shops = await prisma.shop.findMany({
      where: {
        approvalStatus: "APPROVED",
        latitude: { not: null },
        longitude: { not: null },
        ...(category ? { category } : {}),
        ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
        ...(brand
          ? { company: { brandName: { equals: brand, mode: "insensitive" } } }
          : {}),
        ...(q
          ? {
              OR: [
                { shopName: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
                { sector: { contains: q, mode: "insensitive" } },
                { company: { brandName: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        shopName: true,
        city: true,
        sector: true,
        address: true,
        phone: true,
        category: true,
        outletCode: true,
        latitude: true,
        longitude: true,
        company: { select: { brandName: true, id: true } },
      },
      take: 500,
    });

    const nearby = shops
      .map((shop) => {
        const distanceKm = haversineKm(lat, lng, shop.latitude!, shop.longitude!);
        return { ...shop, distanceKm };
      })
      .filter((s) => s.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const payload = buildPayload(lat, lng, radiusKm, nearby);
    cacheSet(cacheKey, payload, 45_000);
    return jsonOk(payload);
  } catch (error) {
    return handleApiError(error);
  }
}

function buildPayload(
  lat: number,
  lng: number,
  radiusKm: number,
  nearby: Array<{
    id: string;
    shopName: string;
    city: string;
    sector: string | null;
    address: string;
    phone: string;
    category: string;
    outletCode: string | null;
    latitude: number | null;
    longitude: number | null;
    distanceKm: number;
    company: { brandName: string; id: string } | null;
  }>
) {
  return {
    location: { lat, lng },
    radiusKm,
    count: nearby.length,
    shops: nearby.map((s) => ({
      id: s.id,
      shopName: s.shopName,
      brandName: s.company?.brandName ?? null,
      city: s.city,
      sector: s.sector,
      address: s.address,
      phone: s.phone,
      category: s.category,
      outletCode: s.outletCode,
      latitude: s.latitude,
      longitude: s.longitude,
      distanceKm: Math.round(s.distanceKm * 10) / 10,
      networkWarranty: !!s.company,
    })),
  };
}
