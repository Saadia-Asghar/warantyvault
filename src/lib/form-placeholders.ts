/** Neutral input placeholders — format hints only, not credentials */
export const AUTH_PLACEHOLDERS = {
  email: {
    company: "brand@yourcompany.com",
    shop: "outlet@shopname.com",
    buyer: "you@email.com",
    admin: "admin@yourcompany.com",
  },
  password: "Min. 8 characters",
  phone: "03001234567",
  buyerName: "Ahmed Khan",
  legalCompanyName: "Your Company (Pvt) Ltd",
  brandName: "Your Brand",
  ntn: "1234567-8",
  shopName: "Your Shop G-6",
  ownerName: "Shop Owner Name",
  city: "Islamabad",
  sector: "G-6",
  address: "Plot 12, Markaz",
} as const;

export function authEmailPlaceholder(role: "buyer" | "shop" | "company" | "admin"): string {
  return AUTH_PLACEHOLDERS.email[role];
}
