"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Building2, Store, User, FileX, MapPin, Smartphone, QrCode } from "lucide-react";

const scenes = [
  {
    icon: FileX,
    title: "Paper gets lost",
    body: "Shop stamps don't work when you move cities. Your warranty shouldn't depend on a crumpled card in your drawer.",
    hook: "The problem is real. The solution is simple.",
    pastel: "pastel-card-peach",
  },
  {
    icon: MapPin,
    title: "One brand, every city",
    body: "Islamabad G-6 → I-8 → Karachi Saddar. Dollar's Mobile approves every outlet before they can issue.",
    hook: "Buy in G-6. Claim in I-8 or Karachi.",
    pastel: "pastel-card-sky",
  },
  {
    icon: Smartphone,
    title: "Your warranty wallet",
    body: "Shop issues to your phone. You accept in one tap. Every warranty lives in a secure digital wallet.",
    hook: "Like a bank app — but for warranties.",
    pastel: "pastel-card-lavender",
  },
  {
    icon: QrCode,
    title: "QR + hash proof",
    body: "A unique cryptographic hash is registered forever. Anyone can verify — no one can fake it.",
    hook: "Immutable registry. Always retrievable.",
    pastel: "pastel-card-mint",
  },
  {
    icon: User,
    title: "Pick your role",
    body: "Brand HQ approves outlets. Shops issue and verify claims. Customers hold warranties with expiry reminders.",
    hook: "Ready to begin?",
    pastel: "pastel-card-peach",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const scene = scenes[step];
  const isLast = step === scenes.length - 1;
  const Icon = scene.icon;
  const progress = ((step + 1) / scenes.length) * 100;

  function finish() {
    localStorage.setItem("wv_onboarded", "1");
    window.location.href = "/get-started";
  }

  function go(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-deep)]">
      <div className="h-1 bg-[var(--bg-elevated)]">
        <motion.div
          className="h-full bg-[var(--accent)]"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
        <Logo href="/" size={40} />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            <motion.div
              className={`mb-8 flex h-32 items-center justify-center rounded-3xl ${scene.pastel}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Icon className="h-16 w-16 text-[var(--accent)]" strokeWidth={1.5} />
            </motion.div>

            <motion.p
              className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {step + 1} / {scenes.length}
            </motion.p>
            <motion.h1
              className="font-display mt-4 text-3xl font-bold leading-tight text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display), serif" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {scene.title}
            </motion.h1>
            <motion.p
              className="mt-4 text-base leading-relaxed text-[var(--text-muted)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              {scene.body}
            </motion.p>
            <motion.p
              className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-medium text-[var(--accent)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
            >
              {scene.hook}
            </motion.p>

            {isLast && (
              <motion.div
                className="mt-8 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                {[
                  { icon: Building2, label: "Brand / Company", href: "/company/auth" },
                  { icon: Store, label: "Shop / Outlet", href: "/shop/auth" },
                  { icon: User, label: "Customer / Buyer", href: "/buyer/auth" },
                ].map(({ icon: RIcon, label, href }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    <Link
                      href={href}
                      onClick={() => localStorage.setItem("wv_onboarded", "1")}
                      className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition hover:border-[var(--accent)]/40"
                    >
                      <div className="activity-icon">
                        <RIcon className="h-5 w-5" />
                      </div>
                      <span className="flex-1 font-medium text-[var(--text-primary)]">{label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto flex gap-3 pt-10">
          {step > 0 && (
            <button type="button" onClick={() => go(step - 1)} className="btn-secondary flex-1">
              Back
            </button>
          )}
          {isLast ? (
            <button type="button" onClick={finish} className="btn-primary flex-1">
              Get started
            </button>
          ) : (
            <button type="button" onClick={() => go(step + 1)} className="btn-primary flex-1">
              Next
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={finish}
          className="mt-4 text-center text-xs text-[var(--text-tertiary)] hover:text-[var(--text-muted)]"
        >
          Skip intro
        </button>
      </main>
    </div>
  );
}
