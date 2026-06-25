"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Plus, Search, ClipboardList } from "lucide-react";

const tabs = [
  { href: "/shop", label: "Home", icon: LayoutDashboard, match: (p: string) => p === "/shop" },
  { href: "/shop/issue", label: "Issue", icon: Plus, match: (p: string) => p === "/shop/issue" },
  { href: "/shop/claims", label: "Claims", icon: ClipboardList, match: (p: string) => p === "/shop/claims" },
  { href: "/shop/verify", label: "Verify", icon: Search, match: (p: string) => p === "/shop/verify" },
];

export function ShopBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-tab-bar" aria-label="Shop navigation">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn("bottom-tab", active && "bottom-tab-active")}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
