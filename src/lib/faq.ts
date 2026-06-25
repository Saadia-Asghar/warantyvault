export type FaqRole = "general" | "buyer" | "shop" | "company";

export type FaqItem = {
  q: string;
  a: string;
};

export const FAQ_BY_ROLE: Record<FaqRole, FaqItem[]> = {
  general: [
    {
      q: "What is ShopSeal PK?",
      a: "A digital ledger for Pakistan retail: brands dispatch stock to shops, shops seal sales (amount + warranty) to registered buyers, and everyone can verify proof with QR.",
    },
    {
      q: "Is this official PTA or OEM warranty?",
      a: "No. This is the shop/brand network warranty and sale record — useful for disputes and claims at approved outlets, not a replacement for PTA device registration or manufacturer warranty.",
    },
    {
      q: "How do I verify a warranty?",
      a: "Open Verify from the menu or scan the QR on the buyer wallet / PDF certificate. You can verify by short code (e.g. WV-PK-2026-1001) without remembering the hash.",
    },
    {
      q: "Demo accounts — are they real?",
      a: "Demo logins use sample data only. Do not issue real customer warranties in demo mode.",
    },
  ],
  buyer: [
    {
      q: "How do I get a warranty in my wallet?",
      a: "Register with your phone number. When a shop records a sale to that number, tap Accept in your wallet. You must use the same phone the shop entered.",
    },
    {
      q: "Can I sell the item to someone else?",
      a: "Yes — open the warranty, tap Transfer on resale, enter the new buyer's phone and name. They must accept in their wallet. The original shop and brand are notified for transparency.",
    },
    {
      q: "Where can I claim warranty?",
      a: "At the issuing shop, or at any approved outlet in the same brand network (e.g. bought in G-6, claim in I-8). Show your QR from the wallet.",
    },
    {
      q: "Download PDF or share on WhatsApp?",
      a: "On an active warranty, use PDF or WhatsApp share buttons. The PDF is designed for consumer court / dispute evidence.",
    },
    {
      q: "Check IMEI before buying a phone?",
      a: "Use the PTA links on the issue/verify screens (*#06#, DIRBS, 8484) — ShopSeal does not replace PTA registration.",
    },
  ],
  shop: [
    {
      q: "How do I record a sale?",
      a: "Issue tab → buyer phone → product (from inventory or manual) → sale amount & payment (cash/Raast) → seal. Amount is locked in the hash with warranty terms.",
    },
    {
      q: "Receive stock from brand?",
      a: "Inventory tab → incoming dispatch → Mark received. Then pick the unit when recording a sale.",
    },
    {
      q: "Buyer not in the app yet?",
      a: "They should register first, or you can still issue to their phone — they'll get SMS and see it when they sign up.",
    },
    {
      q: "What if a warranty is resold?",
      a: "You get a notification when the owner starts a resale transfer and when the new buyer accepts. Check Records to see current owner.",
    },
    {
      q: "Verify a customer's QR?",
      a: "Verify tab → scan wallet QR to confirm coverage before repair or exchange.",
    },
  ],
  company: [
    {
      q: "Approve new outlets?",
      a: "Outlets tab → review pending applications → Approve or Reject. Only approved outlets can issue network warranties.",
    },
    {
      q: "Dispatch stock to shops?",
      a: "Stock tab → select outlet → product & quantity → Send dispatch. Shop marks received in their Inventory.",
    },
    {
      q: "See sales across the network?",
      a: "Sales and Insights tabs show warranties issued per outlet. Resale transfers also notify brand HQ.",
    },
    {
      q: "Revoke a fraudulent warranty?",
      a: "Open the warranty from Sales → Revoke with a reason. Buyer and audit trail are updated.",
    },
  ],
};

export function detectFaqRole(pathname: string): FaqRole {
  if (pathname.startsWith("/buyer")) return "buyer";
  if (pathname.startsWith("/shop")) return "shop";
  if (pathname.startsWith("/company")) return "company";
  return "general";
}
