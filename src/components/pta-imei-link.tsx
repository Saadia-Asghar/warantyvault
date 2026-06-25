import { ExternalLink, ShieldCheck } from "lucide-react";

/** Deep-link buyers/shops to PTA device verification (no API — official portal). */
export function PtaImeiCheckLink({ imei }: { imei?: string }) {
  const trimmed = imei?.replace(/\D/g, "") ?? "";
  const href =
    trimmed.length >= 14
      ? `https://dirbs.pta.gov.pk/`
      : "https://dirbs.pta.gov.pk/";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      Check PTA / IMEI status (dirbs.pta.gov.pk)
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
