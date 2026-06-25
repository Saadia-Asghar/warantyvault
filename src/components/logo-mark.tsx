import { cn } from "@/lib/utils";

/** Shield + check — Paper Trust palette (navy base, terracotta accent) */
export function LogoMark({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="48" height="48" rx="12" className="fill-[var(--text-primary)]" />
      <path
        d="M24 8L36 14V24C36 32.5 30.5 38.5 24 40C17.5 38.5 12 32.5 12 24V14L24 8Z"
        className="fill-[var(--bg-deep)]"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 24L22 28L30 19"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
