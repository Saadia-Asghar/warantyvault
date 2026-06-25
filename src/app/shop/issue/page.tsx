"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShopBottomNav } from "@/components/shop-bottom-nav";
import { ContextBanner } from "@/components/context-banner";
import { ShopTopBar } from "@/components/shop-top-bar";
import { QrDisplay } from "@/components/qr-display";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type Policy = {
  id: string;
  name: string;
  category: string;
  policyType: string;
  durationMonths: number;
  exclusions: string;
  termsEn: string;
  termsUr: string;
  network?: boolean;
};

const STEPS = ["Buyer", "Product", "Review"];

export default function IssueWarrantyPage() {
  const [step, setStep] = useState(0);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ code: string; id: string; hash: string } | null>(null);
  const [form, setForm] = useState({
    productName: "",
    category: "MOBILE",
    serialImei: "",
    purchaseAmount: "",
    policyType: "REPAIR_ONLY",
    durationMonths: 6,
    exclusions: "Water damage, physical damage, unauthorized repair",
    termsEn: "Repair-only warranty for manufacturing defects. Water and drop damage excluded.",
    termsUr: "Sirf repair ki warranty manufacturing fault ke liye. Pani aur girne ka nuksan shamil nahi.",
    buyerPhone: "",
    buyerName: "",
  });

  useEffect(() => {
    fetch("/api/policies")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          const shop = (j.data.shopPolicies ?? j.data ?? []).map((p: Policy) => ({ ...p, network: false }));
          const company = (j.data.companyPolicies ?? []).map((p: Policy) => ({ ...p, network: true }));
          setPolicies([...company, ...shop]);
        }
      });
  }, []);

  function applyPolicy(p: Policy) {
    setForm({
      ...form,
      category: p.category,
      policyType: p.policyType,
      durationMonths: p.durationMonths,
      exclusions: p.exclusions,
      termsEn: p.termsEn,
      termsUr: p.termsUr,
    });
  }

  async function submit() {
    setLoading(true);
    setError("");
    setSuccess(null);
    try {
      const res = await fetch("/api/warranties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          purchaseAmount: form.purchaseAmount ? parseFloat(form.purchaseAmount) : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Failed to issue warranty");
        return;
      }
      setSuccess({
        code: json.data.warrantyCode,
        id: json.data.id,
        hash: json.data.warrantyHash,
      });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <ContextBanner role="shop" />
      <ShopTopBar title="Issue warranty" subtitle={`Step ${step + 1} of 3 · ${STEPS[step]}`} />
      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)]"}`}
            />
          ))}
        </div>

        <Card>
          {policies.length > 0 && !success && (
            <div className="mb-4 flex flex-wrap gap-2">
              {policies.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPolicy(p)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition hover:border-[var(--accent)] ${
                    p.network ? "border-[var(--pastel-sky)] bg-[var(--pastel-sky)]" : "border-[var(--border)] bg-[var(--bg-elevated)]"
                  }`}
                >
                  {p.network ? "Network: " : ""}
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {success ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 rounded-xl border border-[var(--pastel-mint)] bg-[var(--pastel-mint)] p-5"
            >
              <CheckCircle2 className="mb-2 h-10 w-10 text-[var(--accent)]" />
              <p className="font-semibold text-[var(--text-primary)]">Warranty registered</p>
              <p className="mt-1 font-mono text-sm">{success.code}</p>
              <div className="mt-4 flex justify-center rounded-2xl bg-white p-4">
                <QrDisplay
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify?hash=${success.hash}`}
                  size={160}
                />
              </div>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => {
                  setSuccess(null);
                  setStep(0);
                  setForm({ ...form, productName: "", serialImei: "", buyerPhone: "", buyerName: "" });
                }}
              >
                Issue another
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-4 space-y-4"
              >
                {step === 0 && (
                  <>
                    <Input
                      label="Buyer phone"
                      required
                      value={form.buyerPhone}
                      onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                    />
                    <Input
                      label="Buyer name"
                      required
                      value={form.buyerName}
                      onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                    />
                  </>
                )}
                {step === 1 && (
                  <>
                    <Input
                      label="Product name"
                      required
                      value={form.productName}
                      onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    />
                    <Input
                      label="Serial / IMEI"
                      value={form.serialImei}
                      onChange={(e) => setForm({ ...form, serialImei: e.target.value })}
                    />
                    <div>
                      <label className="label-field">Duration (months)</label>
                      <select
                        className="input-field"
                        value={form.durationMonths}
                        onChange={(e) => setForm({ ...form, durationMonths: parseInt(e.target.value) })}
                      >
                        {[3, 6, 12, 24].map((m) => (
                          <option key={m} value={m}>
                            {m} months
                          </option>
                        ))}
                      </select>
                    </div>
                    <Textarea
                      label="Terms (English)"
                      required
                      value={form.termsEn}
                      onChange={(e) => setForm({ ...form, termsEn: e.target.value })}
                    />
                  </>
                )}
                {step === 2 && (
                  <div className="space-y-2 text-sm text-[var(--text-muted)]">
                    <p>
                      <strong className="text-[var(--text-primary)]">Buyer:</strong> {form.buyerName} ·{" "}
                      {form.buyerPhone}
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Product:</strong> {form.productName}
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Duration:</strong> {form.durationMonths}{" "}
                      months
                    </p>
                    <p className="text-xs leading-relaxed">{form.termsEn}</p>
                  </div>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-2 pt-2">
                  {step > 0 && (
                    <Button variant="secondary" className="flex-1" onClick={() => setStep(step - 1)}>
                      Back
                    </Button>
                  )}
                  {step < 2 ? (
                    <Button className="flex-1" onClick={() => setStep(step + 1)}>
                      Next
                    </Button>
                  ) : (
                    <Button className="flex-1" loading={loading} onClick={() => void submit()}>
                      Register & transfer
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </Card>
        <Link href="/shop/policies" className="btn-ghost mt-4 block text-center text-xs">
          Manage policy templates
        </Link>
      </main>
      <ShopBottomNav />
    </div>
  );
}
