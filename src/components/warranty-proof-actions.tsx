"use client";

import { Download, FileText } from "lucide-react";
import { PtaImeiCheckLink } from "@/components/pta-imei-link";
import { ShareWarrantyNative, WhatsAppWarrantyShare } from "@/components/whatsapp-warranty-share";

type Props = {
  warrantyId: string;
  warrantyCode: string;
  productName: string;
  status: string;
  startDate: string;
  endDate: string;
  shopName: string;
  brandName?: string | null;
  serialImei?: string | null;
  verifyUrl: string;
};

export function WarrantyProofActions({
  warrantyId,
  warrantyCode,
  productName,
  status,
  startDate,
  endDate,
  shopName,
  brandName,
  serialImei,
  verifyUrl,
}: Props) {
  const shareProps = {
    productName,
    warrantyCode,
    status,
    startDate,
    endDate,
    shopName,
    brandName,
    verifyUrl,
  };

  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
        <FileText className="h-4 w-4 text-[var(--accent)]" />
        Proof & sharing
      </p>
      <p className="text-xs text-[var(--text-muted)]">
        Download for consumer court, share with family on WhatsApp, or verify PTA device status.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/warranties/${warrantyId}/pdf`}
          className="btn-primary inline-flex items-center gap-2 text-sm"
          download
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
        <WhatsAppWarrantyShare {...shareProps} />
        <ShareWarrantyNative {...shareProps} />
      </div>
      <PtaImeiCheckLink imei={serialImei ?? undefined} />
    </div>
  );
}
