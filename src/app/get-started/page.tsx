"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Building2, Store, User, ArrowRight } from "lucide-react";

const roles = [
  {
    id: "company",
    title: "Brand / Company",
    desc: "Register your franchise network. Approve outlets in Islamabad, Karachi, Lahore.",
    icon: Building2,
    href: "/company/auth",
    border: "border-[var(--pastel-sky)]",
  },
  {
    id: "shop",
    title: "Shop / Outlet",
    desc: "Join a brand network. Issue warranties customers can claim anywhere in the network.",
    icon: Store,
    href: "/shop/auth",
    border: "border-[var(--pastel-lavender)]",
  },
  {
    id: "buyer",
    title: "Customer / Buyer",
    desc: "Keep all warranties in one wallet. Claim at any approved outlet.",
    icon: User,
    href: "/buyer/auth",
    border: "border-[var(--pastel-mint)]",
  },
];

export default function GetStartedPage() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("wv_onboarded")) {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <Logo href="/" size={36} />
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        <motion.h1
          className="font-display text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Who are you?
        </motion.h1>
        <motion.p
          className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          Choose your role and create a real account — registration is free.
        </motion.p>

        <div className="mt-8 space-y-3">
          {roles.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={r.href}
                className={`group flex items-center gap-4 rounded-2xl border-2 bg-[var(--bg-surface)] p-4 transition ${r.border}`}
              >
                <div className="activity-icon">
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-[var(--text-primary)]">{r.title}</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">{r.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-[var(--text-tertiary)] transition group-hover:text-[var(--accent)]" />
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-[var(--text-tertiary)]">
          <Link href="/onboarding" className="text-[var(--accent)] hover:underline">
            Replay intro
          </Link>
        </p>
      </main>
    </div>
  );
}
