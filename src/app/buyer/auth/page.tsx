"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthTabs } from "@/components/auth-tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function BuyerAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    phone: "03001234567",
    email: "ahmed@demo.pk",
    password: "demo1234",
    name: "Ahmed Khan",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/buyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, ...form }),
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
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Your warranty wallet</h1>
            <p className="text-sm text-[var(--text-muted)]">All your shop warranties in one secure place</p>
          </div>
        </div>

        <Card>
          <AuthTabs mode={mode} onChange={setMode} />

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input
              label="Phone (+92)"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {mode === "register" && (
              <>
                <Input
                  label="Full name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="Email (for notifications & password reset)"
                  type="email"
                  required
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

          <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
            Your session is encrypted · Shop owner?{" "}
            <Link href="/shop/auth" className="text-[var(--accent)] hover:underline">
              Shop portal
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
