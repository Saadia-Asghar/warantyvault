/** Central brand copy — one source of truth */
export const BRAND = {
  name: "WarrantyVault PK",
  shortName: "WarrantyVault",
  tagline: "Digital shop warranties for Pakistan",
  headline: "Your warranty card, on your phone.",
  subhead:
    "Buy at one outlet. Claim at any approved shop in the same brand network. Verify with QR — no paper to lose.",
  footer: "Shop warranty registry — not official OEM or PTA device warranty.",
  demoLabel: "Demo mode — sample data only. Do not use for real customers.",
} as const;

export const ROLE_COPY = {
  buyer: {
    title: "Your warranty wallet",
    subtitle: "View warranties, find outlets, scan QR, chat with shops",
    dashboard: "My warranties",
  },
  shop: {
    title: "Outlet dashboard",
    subtitle: "Issue warranties, verify QR, handle claims, reply to customers",
    dashboard: "Issued today",
  },
  company: {
    title: "Brand network",
    subtitle: "Approve outlets, set policies, monitor warranties and fraud",
    dashboard: "Network overview",
  },
  admin: {
    title: "Platform admin",
    subtitle: "Complaints, audits, and system oversight",
    dashboard: "Admin console",
  },
} as const;
