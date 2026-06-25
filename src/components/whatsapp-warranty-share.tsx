"use client";

import { MessageCircle, Share2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Props = {
  productName: string;
  warrantyCode: string;
  status: string;
  startDate: string;
  endDate: string;
  shopName: string;
  brandName?: string | null;
  verifyUrl: string;
};

export function WhatsAppWarrantyShare({
  productName,
  warrantyCode,
  status,
  startDate,
  endDate,
  shopName,
  brandName,
  verifyUrl,
}: Props) {
  const lines = [
    "ShopSeal PK — sale & warranty proof",
    "",
    `Product: ${productName}`,
    `Code: ${warrantyCode}`,
    `Status: ${status}`,
    `Shop: ${shopName}${brandName ? ` (${brandName})` : ""}`,
    `Valid: ${formatDate(startDate)} → ${formatDate(endDate)}`,
    "",
    `Verify: ${verifyUrl}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  const href = `https://wa.me/?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary inline-flex items-center justify-center gap-2 text-sm"
    >
      <MessageCircle className="h-4 w-4" />
      Share on WhatsApp
    </a>
  );
}

export function ShareWarrantyNative(props: Props) {
  async function share() {
    const lines = [
      `${props.productName} — ${props.warrantyCode}`,
      `${formatDate(props.startDate)} to ${formatDate(props.endDate)}`,
      props.verifyUrl,
    ];
    if (navigator.share) {
      try {
        await navigator.share({
          title: "WarrantyVault PK",
          text: lines.join("\n"),
          url: props.verifyUrl,
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }

  return (
    <button type="button" onClick={() => void share()} className="btn-ghost inline-flex items-center gap-2 text-sm">
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}
