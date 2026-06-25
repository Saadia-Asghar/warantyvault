"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, MapPin, Network, QrCode, Shield } from "lucide-react";
import { BRAND } from "@/lib/copy";
import { DEMO_LOGINS, showDemoCredentials } from "@/lib/demo";

const steps = [
  {
    icon: Network,
    title: "Brand approves outlets",
    text: "HQ verifies each shop before it can issue network warranties.",
  },
  {
    icon: MapPin,
    title: "Buy anywhere in the network",
    text: "Customer buys in G-6, claims in I-8 or Lahore — same brand, same digital warranty.",
  },
  {
    icon: QrCode,
    title: "Verify with QR",
    text: "Terms are locked at purchase. Shop scans customer QR to confirm coverage.",
  },
];

export function LandingHero() {
  const [openStep, setOpenStep] = useState<number | null>(0);

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          {BRAND.tagline}
        </p>
        <h1 className="mt-4 max-w-2xl text-[2rem] font-bold leading-[1.15] tracking-tight text-[var(--text-primary)] sm:text-5xl">
          {BRAND.headline}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--text-muted)]">
          {BRAND.subhead}
        </p>

        <div className="summary-card mt-10 max-w-md">
          <p className="text-sm font-medium text-[var(--text-primary)]">For customers</p>
          <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-muted)]">
            <li>Warranty wallet on your phone</li>
            <li>Map of approved outlets near you</li>
            <li>Chat with the shop that sold you the item</li>
          </ul>
          <p className="mt-4 text-sm font-medium text-[var(--text-primary)]">For shops & brands</p>
          <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-muted)]">
            <li>Issue and verify warranties in seconds</li>
            <li>Cross-city claims within your network</li>
            <li>Fraud alerts and outlet approval</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/get-started" className="btn-primary w-full sm:w-auto">
            Get started
          </Link>
          <Link href="/nearby" className="btn-secondary w-full text-center sm:w-auto">
            Find outlets near me
          </Link>
          <Link href="/verify" className="btn-ghost w-full text-center sm:w-auto">
            Verify a warranty
          </Link>
        </div>
        <p className="mt-4 text-xs text-[var(--text-tertiary)]">{BRAND.footer}</p>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--bg-surface)]/50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">How it works</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Three steps for dealer-network warranties</p>
          <div className="mt-6 space-y-2">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenStep(openStep === i ? null : i)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <div className="activity-icon">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 font-medium text-[var(--text-primary)]">{step.title}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[var(--text-muted)] transition ${openStep === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openStep === i && (
                  <p className="border-t border-[var(--border)] px-4 pb-4 pt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {step.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {showDemoCredentials() && (
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[var(--accent)]" />
              <p className="font-medium text-[var(--text-primary)]">Demo accounts</p>
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Password for all below: <span className="font-mono">demo1234</span> (admin uses{" "}
              <span className="font-mono">admin1234</span>). Each role opens its own dashboard.
            </p>
            <ul className="mt-3 space-y-1.5 font-mono text-xs text-[var(--text-muted)]">
              {DEMO_LOGINS.map((d) => (
                <li key={d.login}>
                  {d.role} · {d.login} / {d.password}
                </li>
              ))}
            </ul>
            <Link href="/get-started" className="btn-secondary mt-4 inline-flex text-sm">
              Choose your role →
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
