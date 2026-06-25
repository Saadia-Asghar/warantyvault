import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function daysUntil(endDate: Date | string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function warrantyStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_TRANSFER: "Pending Transfer",
    PENDING_RESALE: "Pending Resale",
    ACTIVE: "Active",
    EXPIRED: "Expired",
    REVOKED: "Revoked",
  };
  return map[status] ?? status;
}

export function policyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    REPAIR_ONLY: "Repair Only",
    REPAIR_PARTS: "Repair + Parts",
    EXCHANGE: "Exchange",
    SHOP_CREDIT: "Shop Credit",
  };
  return map[type] ?? type;
}
