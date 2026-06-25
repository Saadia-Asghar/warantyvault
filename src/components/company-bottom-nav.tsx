"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, FileText, MapPin } from "lucide-react";

const tabs = [
  { href: "/company", label: "Outlets", icon: MapPin, match: (p: string) => p === "/company" },
  { href: "/company/policies", label: "Policies", icon: FileText, match: (p: string) => p === "/company/policies" },
  { href: "/company/analytics", label: "Analytics", icon: BarChart3, match: (p: string) => p === "/company/analytics" },
];

export function CompanyBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-tab-bar" aria-label="Company navigation">
      <div className="mx-auto flex max-w-lg md:max-w-2xl">
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
