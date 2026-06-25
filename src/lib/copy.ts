/** Central brand copy — one source of truth */
export const BRAND = {
  name: "ShopSeal PK",
  shortName: "ShopSeal",
  legalName: "WarrantyVault PK",
  tagline: "Digital shop sale & warranty records for Pakistan",
  headline: "Every sale sealed. Every warranty on the phone.",
  subhead:
    "Company dispatches stock → shop records sale amount + warranty → buyer gets proof in their wallet. One hash locks price, terms, and optional paper card photo.",
  footer: "Shop sale & warranty registry — not official OEM, PTA, or payment processing.",
  demoLabel: "Demo mode — sample data only. Do not use for real customers.",
} as const;

export const ROLE_COPY = {
  buyer: {
    title: "Your purchase wallet",
    subtitle: "View purchases, warranties, find outlets, scan QR, chat with shops",
    dashboard: "My purchases",
  },
  shop: {
    title: "Outlet dashboard",
    subtitle: "Receive stock, record sales, issue warranties, verify QR, handle claims",
    dashboard: "Sales today",
  },
  company: {
    title: "Brand network",
    subtitle: "Dispatch stock to outlets, approve shops, monitor sales and warranties",
    dashboard: "Network overview",
  },
  admin: {
    title: "Platform admin",
    subtitle: "Complaints, audits, and system oversight",
    dashboard: "Admin console",
  },
} as const;

export const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "RAAST", label: "Raast / bank transfer" },
  { value: "CARD", label: "Card" },
  { value: "OTHER", label: "Other" },
] as const;

export function paymentMethodLabel(method: string | null | undefined): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method ?? "—";
}
