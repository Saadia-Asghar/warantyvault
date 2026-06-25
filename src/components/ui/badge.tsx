import { cn } from "@/lib/utils";

const variants = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  expired: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  revoked: "bg-red-500/15 text-red-300 border-red-500/30",
  default: "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/30",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
