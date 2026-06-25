import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  showText?: boolean;
  href?: string;
  className?: string;
};

export function Logo({ size = 36, showText = true, href = "/", className }: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt="WarrantyVault PK"
        width={size}
        height={size}
        className="rounded-xl"
        priority
      />
      {showText && (
        <span className="text-sm font-bold text-[var(--text-primary)]">
          WarrantyVault <span className="text-[var(--accent)]">PK</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
