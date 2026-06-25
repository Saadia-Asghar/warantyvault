"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, ImageIcon } from "lucide-react";
import { parseWarrantyCodeFromScan, parseWarrantyHashFromScan } from "@/lib/qr-utils";

export type ScanResult =
  | { type: "hash"; value: string }
  | { type: "code"; value: string };

type QrScannerProps = {
  onScan: (result: ScanResult) => void;
  className?: string;
  label?: string;
};

function parseScan(decoded: string): ScanResult | null {
  const code = parseWarrantyCodeFromScan(decoded);
  if (code) return { type: "code", value: code };
  const hash = parseWarrantyHashFromScan(decoded);
  if (/^[a-f0-9]{64}$/i.test(hash)) return { type: "hash", value: hash.toLowerCase() };
  return null;
}

export function QrScanner({
  onScan,
  className,
  label = "Scan warranty QR code",
}: QrScannerProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const uid = useId().replace(/:/g, "");
  const regionId = `wv-qr-${uid}`;
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleDecoded(decoded: string) {
    const parsed = parseScan(decoded);
    if (parsed) {
      onScan(parsed);
      void stopScanner();
    }
  }

  async function startScanner() {
    setError("");
    try {
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 12, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decoded) => handleDecoded(decoded),
        () => {}
      );
      setActive(true);
    } catch {
      setError("Camera access denied or unavailable. Upload a QR image instead.");
      await stopScanner();
    }
  }

  async function scanImageFile(file: File) {
    setError("");
    try {
      const scanner = new Html5Qrcode(regionId, { verbose: false });
      const result = await scanner.scanFile(file, false);
      scanner.clear();
      handleDecoded(result);
    } catch {
      setError("Could not read a warranty QR from that image. Try a clearer photo.");
    }
  }

  return (
    <div className={className}>
      <div
        id={regionId}
        className={`overflow-hidden rounded-xl border border-[var(--border)] bg-black/40 ${
          active ? "min-h-[260px]" : "hidden"
        }`}
      />
      {!active && (
        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-center">
          <Camera className="mb-2 h-8 w-8 text-[var(--text-muted)]" />
          <p className="text-xs text-[var(--text-muted)]">{label}</p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {active ? (
          <Button type="button" variant="secondary" onClick={() => void stopScanner()} className="flex-1">
            <CameraOff className="mr-2 h-4 w-4" />
            Stop camera
          </Button>
        ) : (
          <Button type="button" onClick={() => void startScanner()} className="flex-1">
            <Camera className="mr-2 h-4 w-4" />
            Open camera
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Upload QR image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void scanImageFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}
    </div>
  );
}
