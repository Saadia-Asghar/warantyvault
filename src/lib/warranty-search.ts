import type { Prisma } from "@prisma/client";

const MONTH_NAMES: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

/** Parse "2024-06", "06/2024", "June 2024", "2024" → UTC month range */
export function parseMonthRange(input: string): { gte: Date; lt: Date } | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;

  let year: number;
  let month: number;

  const iso = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]) - 1;
  } else {
    const dmy = raw.match(/^(\d{1,2})[\/\-](\d{4})$/);
    if (dmy) {
      month = Number(dmy[1]) - 1;
      year = Number(dmy[2]);
    } else {
      const named = raw.match(/^([a-z]+)\s+(\d{4})$/);
      if (named && MONTH_NAMES[named[1]] !== undefined) {
        month = MONTH_NAMES[named[1]];
        year = Number(named[2]);
      } else if (/^\d{4}$/.test(raw)) {
        year = Number(raw);
        return {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        };
      } else {
        return null;
      }
    }
  }

  if (month < 0 || month > 11 || year < 2000 || year > 2100) return null;

  return {
    gte: new Date(Date.UTC(year, month, 1)),
    lt: new Date(Date.UTC(year, month + 1, 1)),
  };
}

export type WarrantySearchParams = {
  q?: string | null;
  status?: string | null;
  /** YYYY-MM, MM/YYYY, June 2024, or YYYY */
  dateMonth?: string | null;
  /** Which date field the month filter applies to */
  dateField?: "issued" | "expires" | null;
};

export function buildWarrantyTextFilter(q: string): Prisma.WarrantyWhereInput {
  const term = q.trim();
  return {
    OR: [
      { productName: { contains: term, mode: "insensitive" } },
      { warrantyCode: { contains: term, mode: "insensitive" } },
      { buyerPhone: { contains: term } },
      { buyerName: { contains: term, mode: "insensitive" } },
      { serialImei: { contains: term, mode: "insensitive" } },
      { warrantyHash: { contains: term, mode: "insensitive" } },
      { buyer: { name: { contains: term, mode: "insensitive" } } },
      { buyer: { phone: { contains: term } } },
      { company: { brandName: { contains: term, mode: "insensitive" } } },
      { shop: { shopName: { contains: term, mode: "insensitive" } } },
    ],
  };
}

export function buildWarrantySearchWhere(
  params: WarrantySearchParams,
  scope: Prisma.WarrantyWhereInput
): Prisma.WarrantyWhereInput {
  const and: Prisma.WarrantyWhereInput[] = [scope];

  if (params.status) {
    and.push({ status: params.status });
  }

  if (params.q?.trim()) {
    and.push(buildWarrantyTextFilter(params.q));
  }

  const range = params.dateMonth ? parseMonthRange(params.dateMonth) : null;
  if (range) {
    const field = params.dateField === "issued" ? "startDate" : "endDate";
    and.push({
      [field]: { gte: range.gte, lt: range.lt },
    } as Prisma.WarrantyWhereInput);
  }

  return and.length === 1 ? and[0] : { AND: and };
}

export const WARRANTY_SEARCH_INCLUDE = {
  shop: { select: { shopName: true, city: true, sector: true } },
  company: { select: { brandName: true } },
  buyer: { select: { name: true, phone: true } },
} as const;
