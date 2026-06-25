"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthTabs } from "@/components/auth-tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, ArrowLeft } from "lucide-react";
import { ROLE_COPY } from "@/lib/copy";
import { DEMO_LOGINS, showDemoCredentials } from "@/lib/demo";

type Company = { id: string; brandName: string };

export default function ShopAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    shopName: "",
    ownerName: "",
    phone: "",
    city: "",
    sector: "",
    address: "",
    category: "MOBILE",
    companyId: "",
    joinNetwork: true,
  });

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data[0]) {
          setCompanies(j.data);
          setForm((f) => ({ ...f, companyId: j.data[0].id }));
        }
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: mode, ...form }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error ?? "Something went wrong");
      return;
    }
    router.push("/shop");
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
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{ROLE_COPY.shop.title}</h1>
            <p className="text-sm text-[var(--text-muted)]">{ROLE_COPY.shop.subtitle}</p>
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
                  label="Shop display name"
                  required
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                />
                <Input
                  label="Owner name"
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                />
                <Input
                  label="Phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="City"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                  <Input
                    label="Sector / area"
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  />
                </div>
                <Input
                  label="Full address"
                  required
                  minLength={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="G-6 Markaz, Plot 12, or full street address"
                />
                <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    className="rounded border-[var(--border)]"
                    checked={form.joinNetwork}
                    onChange={(e) => setForm({ ...form, joinNetwork: e.target.checked })}
                  />
                  Apply to join a brand network
                </label>
                {form.joinNetwork && companies.length > 0 && (
                  <div>
                    <label className="label-field">Select brand</label>
                    <select
                      className="input-field"
                      value={form.companyId}
                      onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.brandName}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-amber-400/90">
                      Brand HQ must approve before you can issue warranties.
                    </p>
                  </div>
                )}
              </>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              {mode === "login" ? "Sign in" : "Register outlet"}
            </Button>
            {mode === "login" && (
              <p className="text-center text-xs">
                <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
                  Forgot password?
                </Link>
              </p>
            )}
          </form>
          {showDemoCredentials() && (
            <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-muted)]">
              <strong className="text-[var(--text-primary)]">Demo:</strong>{" "}
              {DEMO_LOGINS.filter((d) => d.role.startsWith("Shop"))
                .map((d) => d.login)
                .join(" · ")}{" "}
              / demo1234
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}
