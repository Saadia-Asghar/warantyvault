import { ExternalLink, ShieldCheck } from "lucide-react";

const PTA_DIRBS = "https://dirbs.pta.gov.pk/";
const PTA_COMPLAINT = "https://complaint.pta.gov.pk/";

/** Deep-link to PTA device verification and related official channels. */
export function PtaImeiCheckLink({
  imei,
  compact,
}: {
  imei?: string;
  compact?: boolean;
}) {
  const digits = imei?.replace(/\D/g, "") ?? "";

  return (
    <div className={compact ? "space-y-1" : "mt-2 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3"}>
      {!compact && (
        <p className="text-xs font-medium text-[var(--text-primary)]">PTA device check (before you buy or claim)</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <a
          href={PTA_DIRBS}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          DIRBS portal
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={PTA_COMPLAINT}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
        >
          PTA complaint
          <ExternalLink className="h-3 w-3" />
        </a>
        <span className="text-xs text-[var(--text-muted)]">Dial *#06# for IMEI · SMS 8484</span>
      </div>
      {digits.length >= 14 && (
        <p className="font-mono text-[10px] text-[var(--text-tertiary)]">IMEI on record: {digits}</p>
      )}
    </div>
  );
}
