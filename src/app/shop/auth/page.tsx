"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthTabs } from "@/components/auth-tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { Store, ArrowLeft } from "lucide-react";
import { ROLE_COPY } from "@/lib/copy";
import { DEMO_LOGINS, showDemoCredentials } from "@/lib/demo";
import { shopLoginSchema, shopRegisterSchema } from "@/lib/validators";
import {
  type FieldErrors,
  firstFormError,
  parseApiFieldErrors,
  validateForm,
} from "@/lib/form-errors";

type Company = { id: string; brandName: string };

type ShopForm = {
  email: string;
  password: string;
  shopName: string;
  ownerName: string;
  phone: string;
  city: string;
  sector: string;
  address: string;
  category: "MOBILE" | "APPLIANCE" | "GENERAL";
  companyId: string;
  joinNetwork: boolean;
};

const EMPTY_FORM: ShopForm = {
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
};

export default function ShopAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<ShopForm>(EMPTY_FORM);

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

  function patchForm<K extends keyof ShopForm>(key: K, value: ShopForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
    setFormError("");
  }

  function switchMode(next: "login" | "register") {
    setMode(next);
    setFormError("");
    setFieldErrors({});
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    const schema = mode === "login" ? shopLoginSchema : shopRegisterSchema;
    const validation = validateForm(schema, form);
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      setFormError(firstFormError(validation.fieldErrors));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, ...form }),
      });
      const json = await res.json();
      if (!json.success) {
        const errors = parseApiFieldErrors(json.error ?? "Something went wrong", json.fieldErrors);
        setFieldErrors(errors);
        setFormError(firstFormError(errors));
        return;
      }
      router.push("/shop");
      router.refresh();
    } catch {
      setFormError("Network error — check your connection and try again.");
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
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{ROLE_COPY.shop.title}</h1>
            <p className="text-sm text-[var(--text-muted)]">{ROLE_COPY.shop.subtitle}</p>
          </div>
        </div>

        <Card>
          <AuthTabs mode={mode} onChange={switchMode} />

          <form onSubmit={submit} className="mt-6 space-y-3" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="g6@dollars.demo.pk"
              hint="Work email for this outlet — used to sign in"
              value={form.email}
              error={fieldErrors.email}
              onChange={(e) => patchForm("email", e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="demo1234"
              hint="At least 8 characters"
              minLength={8}
              value={form.password}
              error={fieldErrors.password}
              onChange={(e) => patchForm("password", e.target.value)}
            />
            {mode === "register" && (
              <>
                <Input
                  label="Shop display name"
                  placeholder="Dollar's Mobile G-6"
                  hint="Name customers see on warranties and the map"
                  value={form.shopName}
                  error={fieldErrors.shopName}
                  onChange={(e) => patchForm("shopName", e.target.value)}
                />
                <Input
                  label="Owner name"
                  placeholder="Ahmed Khan"
                  hint="Full name of the shop owner"
                  value={form.ownerName}
                  error={fieldErrors.ownerName}
                  onChange={(e) => patchForm("ownerName", e.target.value)}
                />
                <Input
                  label="Phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="03001234567"
                  hint="Pakistani mobile — 11 digits, no spaces"
                  value={form.phone}
                  error={fieldErrors.phone}
                  onChange={(e) => patchForm("phone", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="City"
                    placeholder="Islamabad"
                    hint="e.g. Islamabad, Lahore"
                    value={form.city}
                    error={fieldErrors.city}
                    onChange={(e) => patchForm("city", e.target.value)}
                  />
                  <Input
                    label="Sector / area"
                    placeholder="G-6"
                    hint="Sector or locality code"
                    value={form.sector}
                    error={fieldErrors.sector}
                    onChange={(e) => patchForm("sector", e.target.value)}
                  />
                </div>
                <Input
                  label="Full address"
                  placeholder="G-6 Markaz, Plot 12"
                  hint="Plot, street, or markaz — min 2 characters (e.g. G-6 Markaz)"
                  value={form.address}
                  error={fieldErrors.address}
                  onChange={(e) => patchForm("address", e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    className="rounded border-[var(--border)]"
                    checked={form.joinNetwork}
                    onChange={(e) => patchForm("joinNetwork", e.target.checked)}
                  />
                  Apply to join a brand network
                </label>
                {form.joinNetwork && (
                  companies.length > 0 ? (
                    <SelectField
                      label="Select brand"
                      hint="Brand HQ must approve before you can issue warranties"
                      value={form.companyId}
                      error={fieldErrors.companyId}
                      onChange={(e) => patchForm("companyId", e.target.value)}
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.brandName}
                        </option>
                      ))}
                    </SelectField>
                  ) : (
                    <p className="text-xs text-amber-400/90">
                      Loading brands… If this stays empty, register as standalone (uncheck network).
                    </p>
                  )
                )}
              </>
            )}
            {formError && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
                {formError}
              </p>
            )}
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
