/** Extract 64-char warranty hash from QR URL or raw paste */
export function parseWarrantyHashFromScan(value: string): string {
  const trimmed = value.trim();
  if (/^[a-f0-9]{64}$/i.test(trimmed)) return trimmed.toLowerCase();

  const hashParam = trimmed.match(/[?&]hash=([a-f0-9]{64})/i);
  if (hashParam) return hashParam[1].toLowerCase();

  try {
    const url = trimmed.startsWith("http")
      ? new URL(trimmed)
      : new URL(trimmed, "http://localhost");
    const h = url.searchParams.get("hash");
    if (h && /^[a-f0-9]{64}$/i.test(h)) return h.toLowerCase();
  } catch {
    /* not a URL */
  }

  return trimmed;
}
