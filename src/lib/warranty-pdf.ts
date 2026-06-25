import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatDate, warrantyStatusLabel } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/copy";

type WarrantyPdfInput = {
  warrantyCode: string;
  productName: string;
  status: string;
  policyType: string;
  serialImei: string | null;
  buyerName: string | null;
  buyerPhone: string | null;
  purchaseAmount: number | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  paperPhotoHash: string | null;
  startDate: Date;
  endDate: Date;
  termsEn: string;
  termsUr: string;
  exclusions: string;
  warrantyHash: string;
  shop: { shopName: string; city: string; phone: string; sector?: string | null };
  company?: { brandName: string } | null;
  buyer?: { name: string; phone: string } | null;
};

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxLen) {
      if (line) lines.push(line);
      line = w.length > maxLen ? w.slice(0, maxLen) : w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export async function buildWarrantyPdf(
  w: WarrantyPdfInput,
  verifyUrl: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 50;
  let y = 800;
  const ink = rgb(0.18, 0.19, 0.26);
  const muted = rgb(0.42, 0.45, 0.54);
  const accent = rgb(0.83, 0.44, 0.35);

  const draw = (text: string, size: number, font = regular, color = ink) => {
    page.drawText(text, { x: margin, y, size, font, color });
    y -= size + 6;
  };

  page.drawText("ShopSeal PK", { x: margin, y, size: 10, font: regular, color: accent });
  y -= 14;
  draw("DIGITAL SALE & WARRANTY CERTIFICATE", 16, bold);
  draw("For consumer court / shop dispute evidence", 9, regular, muted);
  y -= 8;

  const customer = w.buyer?.name ?? w.buyerName ?? "—";
  const phone = w.buyer?.phone ?? w.buyerPhone ?? "—";

  const rows: [string, string][] = [
    ["Warranty code", w.warrantyCode],
    ["Product", w.productName],
    ["Status", warrantyStatusLabel(w.status)],
    ["Customer", customer],
    ["Phone", phone],
    ["Issuing shop", `${w.shop.shopName}, ${w.shop.sector ? `${w.shop.sector}, ` : ""}${w.shop.city}`],
    ["Shop phone", w.shop.phone],
    ["Brand network", w.company?.brandName ?? "Standalone shop"],
    ["Policy", w.policyType],
    ["IMEI / serial", w.serialImei ?? "—"],
    ["Sale amount (PKR)", w.purchaseAmount != null ? w.purchaseAmount.toLocaleString("en-PK") : "—"],
    ["Payment", paymentMethodLabel(w.paymentMethod)],
    ...(w.paymentReference ? [["Payment ref", w.paymentReference] as [string, string]] : []),
    ...(w.paperPhotoHash ? [["Paper card photo hash", `${w.paperPhotoHash.slice(0, 16)}…`] as [string, string]] : []),
    ["Start date", formatDate(w.startDate)],
    ["Expiry date", formatDate(w.endDate)],
    ["Verify online", verifyUrl],
  ];

  for (const [label, value] of rows) {
    page.drawText(`${label}:`, { x: margin, y, size: 9, font: bold, color: muted });
    const lines = wrapText(value, 70);
    for (const line of lines) {
      page.drawText(line, { x: margin + 110, y, size: 9, font: regular, color: ink });
      y -= 12;
    }
    y -= 2;
  }

  y -= 6;
  draw("Terms (English)", 11, bold);
  for (const line of wrapText(w.termsEn, 90).slice(0, 8)) {
    draw(line, 8, regular, muted);
  }

  if (w.termsUr) {
    y -= 4;
    draw("Terms (Urdu)", 11, bold);
    for (const line of wrapText(w.termsUr, 90).slice(0, 6)) {
      draw(line, 8, regular, muted);
    }
  }

  if (w.exclusions) {
    y -= 4;
    draw(`Exclusions: ${w.exclusions}`, 8, regular, muted);
  }

  y -= 8;
  draw("Integrity hash (SHA-256)", 10, bold);
  for (const line of wrapText(w.warrantyHash, 85)) {
    draw(line, 7, regular, muted);
  }

  y -= 10;
  draw("Consumer protection notice", 10, bold);
  const notice =
    "Under Punjab/KPK consumer protection laws, you may give written notice to the seller within 15 days of a defect. " +
    "Attach this certificate and your purchase proof when filing with the district consumer court or contacting the brand network HQ.";
  for (const line of wrapText(notice, 92)) {
    draw(line, 8, regular, muted);
  }

  y -= 8;
  draw(
    `Generated ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })} · Shop warranty registry — not official OEM or PTA device warranty.`,
    7,
    regular,
    muted
  );

  return doc.save();
}
