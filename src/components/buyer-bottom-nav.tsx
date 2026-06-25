"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Shield, User, MapPin } from "lucide-react";

const tabs = [
  { href: "/buyer", label: "Warranties", icon: Shield, match: (p: string) => p === "/buyer" || p.startsWith("/buyer/warranty") },
  { href: "/nearby", label: "Nearby", icon: MapPin, match: (p: string) => p === "/nearby" },
  { href: "/verify", label: "Verify", icon: Search, match: (p: string) => p === "/verify" },
  { href: "/buyer/profile", label: "Profile", icon: User, match: (p: string) => p.startsWith("/buyer/profile") },
];

export function BuyerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-tab-bar" aria-label="Buyer navigation">
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
