"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, MapPin, Network, QrCode, Shield } from "lucide-react";

const steps = [
  {
    icon: Network,
    title: "Brand approves outlets",
    text: "Company HQ verifies each shop — G-6, I-8, Saddar — before they can issue.",
  },
  {
    icon: MapPin,
    title: "Cross-city claims",
    text: "Same brand, any approved outlet. Move house or travel — warranty still works.",
  },
  {
    icon: QrCode,
    title: "Verify in seconds",
    text: "Terms locked at purchase. Customer shows QR — shop confirms instantly.",
  },
];

export function LandingHero() {
  const [openStep, setOpenStep] = useState<number | null>(0);

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          Pakistan&apos;s dealer network warranty registry
        </p>
        <h1 className="mt-4 max-w-2xl text-[2rem] font-bold leading-[1.15] tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Paper gets lost. <span className="text-accent">Your warranty shouldn&apos;t.</span>
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--text-muted)]">
          Buy in <strong className="text-[var(--text-primary)]">G-6</strong>, claim in{" "}
          <strong className="text-[var(--text-primary)]">I-8</strong> or{" "}
          <strong className="text-[var(--text-primary)]">Karachi</strong> — one brand, one
          digital warranty, verified by QR.
        </p>

        {/* Chime-style preview summary card */}
        <div className="summary-card mt-10 max-w-sm">
          <p className="text-sm text-[var(--text-muted)]">Your coverage</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            You&apos;re covered
          </p>
          <p className="mt-2 text-sm text-[var(--accent)]">3 active warranties · 1 expiring soon</p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">Nearest expiry · 12 days</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/get-started" className="btn-primary w-full sm:w-auto">
            Get started
          </Link>
          <Link href="/nearby" className="btn-secondary w-full text-center sm:w-auto">
            Shops near me
          </Link>
          <Link href="/verify" className="btn-ghost w-full text-center sm:w-auto">
            Verify a warranty
          </Link>
        </div>
      </section>

      {/* Chime-style accordion — how it works */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-surface)]/50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">How it works</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Tap to explore each step
          </p>
          <div className="mt-6 space-y-2">
            {steps.map((step, i) => (
              <div key={step.title} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">
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

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--accent)]" />
            <p className="font-medium text-[var(--text-primary)]">Try the demo</p>
          </div>
          <ul className="mt-3 space-y-1.5 font-mono text-xs text-[var(--text-muted)]">
            <li>Brand · dollarsmobile@demo.pk / demo1234</li>
            <li>Shop G-6 · g6@dollars.demo.pk / demo1234</li>
            <li>Shop I-8 · i8@dollars.demo.pk / demo1234</li>
            <li>Shop Lahore · lhr@dollars.demo.pk / demo1234</li>
            <li>Buyer · 03001234567 / demo1234</li>
          </ul>
        </div>
      </section>
    </>
  );
}
