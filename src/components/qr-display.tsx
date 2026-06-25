"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrDisplay({ value, size = 180 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: { dark: "#059669", light: "#ffffff" },
    }).then(setDataUrl);
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-xl bg-white/5"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- QR data URL
    <img
      src={dataUrl}
      alt="Warranty QR Code"
      className="rounded-xl border border-white/10"
      width={size}
      height={size}
    />
  );
}
