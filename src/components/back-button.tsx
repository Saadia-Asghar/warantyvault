"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function fallbackForPath(pathname: string): string {
  if (pathname.startsWith("/buyer/warranty")) return "/buyer";
  if (pathname.startsWith("/buyer/messages")) return "/buyer/messages";
  if (pathname.startsWith("/buyer")) return "/get-started";
  if (pathname.startsWith("/shop/messages")) return "/shop/messages";
  if (pathname.startsWith("/shop")) return "/get-started";
  if (pathname.startsWith("/company")) return "/get-started";
  if (pathname.startsWith("/admin")) return "/";
  if (pathname === "/get-started" || pathname === "/onboarding") return "/";
  if (pathname === "/verify" || pathname.startsWith("/verify/")) return "/";
  if (pathname === "/nearby" || pathname === "/about") return "/";
  if (pathname === "/complaints" || pathname === "/forgot-password") return "/";
  return "/";
}

type BackButtonProps = {
  className?: string;
  label?: string;
  fallbackHref?: string;
};

export function BackButton({ className, label = "Back", fallbackHref }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const fallback = fallbackHref ?? fallbackForPath(pathname);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
        className
      )}
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}

export function PageBackBar({ className }: { className?: string }) {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div
      className={cn(
        "border-b border-[var(--border)] bg-[var(--bg-deep)]/95 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl px-4 py-2 sm:px-6">
        <BackButton />
      </div>
    </div>
  );
}
