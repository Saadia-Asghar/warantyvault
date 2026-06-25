"use client";

import { useState } from "react";
import Link from "next/link";
import { BuyerBottomNav } from "@/components/buyer-bottom-nav";
import { ChevronDown, Shield } from "lucide-react";

const sections = [
  {
    title: "Stack",
    items: [
      "Next.js 14 App Router + TypeScript",
      "Prisma ORM + SQLite (local) / Postgres (production)",
      "JWT sessions (httpOnly cookies, bcrypt passwords)",
      "SHA-256 warranty hashes + immutable chain registry",
      "Zod validation on all API inputs",
    ],
  },
  {
    title: "Security",
    items: [
      "Role-based middleware (company / shop / buyer / admin)",
      "No PII on-chain — only cryptographic hashes",
      "Warranty terms immutable after registration",
      "Duplicate serial/IMEI detection",
      "Brand must approve outlets before network issuance",
    ],
  },
  {
    title: "Network warranty flow",
    items: [
      "Brand registers → outlets apply → brand approves",
      "Shop issues warranty at G-6 → buyer accepts in wallet",
      "Customer claims at I-8 or Karachi — same brand network",
      "Shop scans QR → verifies hash → opens claim",
    ],
  },
];

export default function AboutPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <header className="border-b border-[var(--border)] px-4 py-3">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          ← Home
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <div className="activity-icon">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">How it works</h1>
            <p className="text-xs text-[var(--text-muted)]">WarrantyVault PK</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="summary-card">
          <p className="text-sm text-[var(--text-muted)]">Built for Pakistan</p>
          <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
            Digital warranties that travel with you
          </p>
          <p className="mt-2 text-sm text-[var(--accent)]">
            Buy in one sector · claim in another city
          </p>
        </div>

        <div className="mt-6 space-y-2">
          {sections.map((section, i) => (
            <div
              key={section.title}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <span className="flex-1 font-medium text-[var(--text-primary)]">{section.title}</span>
                <ChevronDown
                  className={`h-5 w-5 text-[var(--text-muted)] transition ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <ul className="space-y-2 border-t border-[var(--border)] px-4 py-4 text-sm text-[var(--text-muted)]">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-[var(--accent)]">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <Link href="/get-started" className="btn-primary mt-8 w-full">
          Get started
        </Link>
      </main>

      <BuyerBottomNav />
    </div>
  );
}
