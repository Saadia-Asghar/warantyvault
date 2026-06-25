import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/logo-mark";
import { BRAND } from "@/lib/copy";

type LogoProps = {
  size?: number;
  showText?: boolean;
  href?: string;
  className?: string;
};

export function Logo({ size = 36, showText = true, href = "/", className }: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showText && (
        <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
          {BRAND.shortName}{" "}
          <span className="font-semibold text-[var(--accent)]">PK</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex" aria-label={BRAND.name}>
        {content}
      </Link>
    );
  }

  return content;
}
