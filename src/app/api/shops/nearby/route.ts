import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonOk } from "@/lib/api";
import { haversineKm } from "@/lib/geo";
import { z } from "zod";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(500).default(50),
  category: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { lat, lng, radiusKm, category } = querySchema.parse(params);

    const shops = await prisma.shop.findMany({
      where: {
        approvalStatus: "APPROVED",
        latitude: { not: null },
        longitude: { not: null },
        ...(category ? { category } : {}),
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
    });

    const nearby = shops
      .map((shop) => {
        const distanceKm = haversineKm(lat, lng, shop.latitude!, shop.longitude!);
        return { ...shop, distanceKm };
      })
      .filter((s) => s.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return jsonOk({
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
    });
  } catch (error) {
    return handleApiError(error);
  }
}
