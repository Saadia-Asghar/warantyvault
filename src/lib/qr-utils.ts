/** Extract warranty hash or short code from QR URL, image scan, or paste */
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
    const code = url.searchParams.get("code");
    if (code) return code.trim();
  } catch {
    /* not a URL */
  }

  return trimmed;
}

export function parseWarrantyCodeFromScan(value: string): string | null {
  const trimmed = value.trim();
  if (/^WV-PK-/i.test(trimmed)) return trimmed.toUpperCase();

  const codeParam = trimmed.match(/[?&]code=([^&]+)/i);
  if (codeParam) return decodeURIComponent(codeParam[1]).trim().toUpperCase();

  try {
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, "http://localhost");
    const code = url.searchParams.get("code");
    if (code) return code.trim().toUpperCase();
  } catch {
    /* ignore */
  }

  return null;
}

export function buildVerifyUrl(origin: string, opts: { hash?: string; code?: string }): string {
  if (opts.code) return `${origin}/verify?code=${encodeURIComponent(opts.code)}`;
  if (opts.hash) return `${origin}/verify?hash=${opts.hash}`;
  return `${origin}/verify`;
}
