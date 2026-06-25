"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthTabs } from "@/components/auth-tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { ROLE_COPY } from "@/lib/copy";
import { AUTH_PLACEHOLDERS } from "@/lib/form-placeholders";

export default function BuyerAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    phone: "",
    email: "",
    password: "",
    name: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload =
        mode === "login"
          ? { action: mode, email: form.email, password: form.password }
          : { action: mode, ...form };
      const res = await fetch("/api/auth/buyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Something went wrong");
        return;
      }
      router.push("/buyer");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <header className="border-b border-[var(--border)] px-4 py-3">
        <Link
          href="/get-started"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </header>
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="activity-icon">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{ROLE_COPY.buyer.title}</h1>
            <p className="text-sm text-[var(--text-muted)]">{ROLE_COPY.buyer.subtitle}</p>
          </div>
        </div>

        <Card>
          <AuthTabs mode={mode} onChange={setMode} />

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "login" ? (
              <Input
                label="Email"
                type="email"
                required
                autoComplete="email"
                placeholder={AUTH_PLACEHOLDERS.email.buyer}
                hint="Sign in with the email on your account"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            ) : (
              <>
                <Input
                  label="Phone (+92)"
                  required
                  placeholder={AUTH_PLACEHOLDERS.phone}
                  hint="Pakistani mobile — shops use this to link warranties to your wallet"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  label="Full name"
                  required
                  placeholder={AUTH_PLACEHOLDERS.buyerName}
                  hint="Name shown on your warranty wallet"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={AUTH_PLACEHOLDERS.email.buyer}
                  hint="Used to sign in, get reminders, and reset your password"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </>
            )}
            <Input
              label="Password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={AUTH_PLACEHOLDERS.password}
              hint="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              {mode === "login" ? "Open wallet" : "Create account"}
            </Button>
            {mode === "login" && (
              <p className="text-center text-xs">
                <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
                  Forgot password?
                </Link>
              </p>
            )}
          </form>

          <p className="mt-3 text-center text-xs text-[var(--text-tertiary)]">
            Shop owner?{" "}
            <Link href="/shop/auth" className="text-[var(--accent)] hover:underline">
              Outlet login
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
