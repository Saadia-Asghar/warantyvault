"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthTabs } from "@/components/auth-tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, ArrowLeft } from "lucide-react";

export default function CompanyAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "dollarsmobile@demo.pk",
    password: "demo1234",
    legalName: "Dollar's Mobile Pakistan (Pvt) Ltd",
    brandName: "Dollar's Mobile",
    phone: "0511234567",
    ntn: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: mode, ...form }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error);
      return;
    }
    router.push("/company");
    router.refresh();
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
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Brand / Company</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Manage your dealer network nationwide
            </p>
          </div>
        </div>

        <Card>
          <AuthTabs mode={mode} onChange={setMode} />

          <form onSubmit={submit} className="mt-6 space-y-3">
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {mode === "register" && (
              <>
                <Input
                  label="Legal company name"
                  required
                  value={form.legalName}
                  onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                />
                <Input
                  label="Brand name (shown to customers)"
                  required
                  value={form.brandName}
                  onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                />
                <Input
                  label="Phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  label="NTN (optional)"
                  value={form.ntn}
                  onChange={(e) => setForm({ ...form, ntn: e.target.value })}
                />
              </>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              {mode === "login" ? "Sign in" : "Register brand"}
            </Button>
            {mode === "login" && (
              <p className="text-center text-xs">
                <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
                  Forgot password?
                </Link>
              </p>
            )}
          </form>
        </Card>
      </main>
    </div>
  );
}
