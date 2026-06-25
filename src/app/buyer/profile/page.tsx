"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BuyerBottomNav } from "@/components/buyer-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletLinkCard } from "@/components/wallet-link-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User } from "lucide-react";

export default function BuyerProfilePage() {
  const [session, setSession] = useState<{
    session: { name?: string; email?: string; phone?: string };
  } | null>(null);
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setSession(j.data);
      });
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setPrefs(j.data);
      });
  }, []);

  async function toggleReminderEmails() {
    const next = prefs.reminderEmails === "false" ? "true" : "false";
    await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "reminderEmails", value: next }),
    });
    setPrefs((p) => ({ ...p, reminderEmails: next }));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Profile</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="summary-card flex items-center gap-4">
          <div className="activity-icon h-14 w-14">
            <User className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {session?.session?.name ?? "Buyer"}
            </p>
            <p className="text-sm text-[var(--text-muted)]">{session?.session?.phone}</p>
            {session?.session?.email && (
              <p className="text-xs text-[var(--text-tertiary)]">{session.session.email}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <WalletLinkCard />
        </div>

        <section className="panel mt-4 p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h2>
          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm text-[var(--text-muted)]">Email expiry reminders</span>
            <input
              type="checkbox"
              checked={prefs.reminderEmails !== "false"}
              onChange={() => void toggleReminderEmails()}
              className="h-5 w-5 accent-[var(--accent)]"
            />
          </label>
        </section>

        <section className="panel mt-4 p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Password</h2>
          <div className="mt-3 space-y-3">
            <Input
              label="Current password"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
            <Input
              label="New password"
              type="password"
              minLength={8}
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
            />
            <Button
              className="w-full"
              onClick={async () => {
                const res = await fetch("/api/auth/change-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.next,
                  }),
                });
                const j = await res.json();
                setMessage(j.success ? "Password updated" : j.error);
                if (j.success) setPasswords({ current: "", next: "" });
              }}
            >
              Update password
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                const res = await fetch("/api/auth/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    role: "buyer",
                    email: session?.session?.email,
                  }),
                });
                const j = await res.json();
                setMessage(j.success ? j.data.message : j.error);
              }}
            >
              Email reset link instead
            </Button>
          </div>
          {message && <p className="mt-2 text-xs text-[var(--accent)]">{message}</p>}
        </section>

        <Link href="/onboarding" className="btn-secondary mt-6 w-full">
          Replay how it works
        </Link>

        <button type="button" onClick={() => void logout()} className="btn-ghost mt-4 w-full text-red-500">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </button>
      </main>

      <BuyerBottomNav />
    </div>
  );
}
