"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LogOut,
  LayoutDashboard,
  Search,
  Building2,
  Shield,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/logo";

type NavProps = {
  role?: "shop" | "buyer" | "admin" | "company" | null;
  name?: string;
};

export function Navbar({ role, name }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const shopLinks = [
    { href: "/shop", label: "Dashboard", icon: LayoutDashboard },
    { href: "/shop/issue", label: "Issue", icon: Plus },
    { href: "/shop/verify", label: "Verify", icon: Search },
  ];

  const buyerLinks = [
    { href: "/buyer", label: "My Warranties", icon: Shield },
  ];

  const companyLinks = [
    { href: "/company", label: "Network", icon: Building2 },
  ];

  const links =
    role === "shop"
      ? shopLinks
      : role === "buyer"
        ? buyerLinks
        : role === "company"
          ? companyLinks
          : role === "admin"
            ? [{ href: "/admin", label: "Admin", icon: LayoutDashboard }]
            : [];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-deep)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo size={36} />

        {links.length > 0 && (
          <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {!role && (
            <Link href="/get-started" className="btn-primary px-3 py-2 text-xs sm:px-4">
              Get started
            </Link>
          )}
          {role && (
            <>
              <span className="hidden max-w-[120px] truncate text-xs text-slate-400 sm:block">
                {name}
              </span>
              <button type="button" onClick={logout} className="btn-secondary px-3 py-2">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
