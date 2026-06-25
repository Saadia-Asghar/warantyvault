"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShopBottomNav } from "@/components/shop-bottom-nav";
import { WalletLinkCard } from "@/components/wallet-link-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, LogOut, Store } from "lucide-react";

export default function ShopProfilePage() {
  const [session, setSession] = useState<{
    session: { name?: string; email?: string };
  } | null>(null);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setSession(j.data);
      });
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <header className="border-b border-[var(--border)] px-4 py-3">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Outlet home
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="activity-icon">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Outlet profile</h1>
            <p className="text-sm text-[var(--text-muted)]">{session?.session?.email}</p>
          </div>
        </div>

        <WalletLinkCard />

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
          </div>
          {message && <p className="mt-2 text-xs text-[var(--accent)]">{message}</p>}
        </section>

        <button type="button" onClick={() => void logout()} className="btn-ghost mt-6 w-full text-red-500">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </button>
      </main>

      <ShopBottomNav />
    </div>
  );
}
