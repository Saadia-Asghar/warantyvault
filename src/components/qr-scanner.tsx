"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";
import { parseWarrantyHashFromScan } from "@/lib/qr-utils";

type QrScannerProps = {
  onScan: (value: string) => void;
  className?: string;
};

export function QrScanner({ onScan, className }: QrScannerProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "wv-qr-reader";

  useEffect(() => {
    return () => {
      void stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        /* already stopped */
      }
      scannerRef.current = null;
    }
    setActive(false);
  }

  async function startScanner() {
    setError("");
    try {
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          const value = parseWarrantyHashFromScan(decoded);
          if (/^[a-f0-9]{64}$/i.test(value)) {
            onScan(value);
            void stopScanner();
          }
        },
        () => {}
      );
      setActive(true);
    } catch {
      setError("Camera access denied or unavailable. Paste the hash manually.");
      await stopScanner();
    }
  }

  return (
    <div className={className}>
      <div
        id={regionId}
        className={`overflow-hidden rounded-xl border border-[var(--border)] bg-black/40 ${
          active ? "min-h-[240px]" : "hidden"
        }`}
      />
      {!active && (
        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-center">
          <Camera className="mb-2 h-8 w-8 text-[var(--text-muted)]" />
          <p className="text-xs text-[var(--text-muted)]">
            Scan buyer&apos;s warranty QR code
          </p>
        </div>
      )}
      <div className="mt-3 flex gap-2">
        {active ? (
          <Button type="button" variant="secondary" onClick={() => void stopScanner()} className="w-full">
            <CameraOff className="mr-2 h-4 w-4" />
            Stop scanner
          </Button>
        ) : (
          <Button type="button" onClick={() => void startScanner()} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Open camera scanner
          </Button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}
    </div>
  );
}
