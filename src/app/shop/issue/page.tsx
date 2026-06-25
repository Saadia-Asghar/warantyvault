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
import { CheckCircle2, Camera } from "lucide-react";
import { PtaImeiCheckLink } from "@/components/pta-imei-link";
import { PAYMENT_METHODS } from "@/lib/copy";
import { hashFileSha256 } from "@/lib/client-hash";

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

type StockRow = {
  id: string;
  productName: string;
  category: string;
  serialImei: string | null;
  sku: string | null;
};

const STEPS = ["Buyer", "Product", "Sale", "Review"];

export default function IssueWarrantyPage() {
  const [step, setStep] = useState(0);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [inventory, setInventory] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hashingPhoto, setHashingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ code: string; id: string; hash: string } | null>(null);
  const [form, setForm] = useState({
    stockItemId: "",
    productName: "",
    category: "MOBILE",
    serialImei: "",
    purchaseAmount: "",
    paymentMethod: "CASH",
    paymentReference: "",
    paperPhotoHash: "",
    paperPhotoName: "",
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
    fetch("/api/shop/stock")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setInventory(j.data.inventory ?? []);
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

  function selectStock(item: StockRow) {
    setForm({
      ...form,
      stockItemId: item.id,
      productName: item.productName,
      category: item.category,
      serialImei: item.serialImei ?? "",
    });
  }

  async function onPaperPhoto(file: File | null) {
    if (!file) return;
    setHashingPhoto(true);
    try {
      const hash = await hashFileSha256(file);
      setForm({ ...form, paperPhotoHash: hash, paperPhotoName: file.name });
    } catch {
      setError("Could not hash photo — try another image");
    } finally {
      setHashingPhoto(false);
    }
  }

  function canAdvance(): boolean {
    if (step === 0) return form.buyerPhone.length >= 10 && form.buyerName.length >= 2;
    if (step === 1) return form.productName.length >= 2;
    if (step === 2) {
      const amount = parseFloat(form.purchaseAmount);
      if (!amount || amount <= 0) return false;
      if (form.paymentMethod === "RAAST" && !form.paymentReference.trim()) return false;
      return true;
    }
    return true;
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
          productName: form.productName,
          category: form.category,
          serialImei: form.serialImei || undefined,
          purchaseAmount: parseFloat(form.purchaseAmount),
          paymentMethod: form.paymentMethod,
          paymentReference: form.paymentReference || undefined,
          paperPhotoHash: form.paperPhotoHash || undefined,
          stockItemId: form.stockItemId || undefined,
          policyType: form.policyType,
          durationMonths: form.durationMonths,
          exclusions: form.exclusions,
          termsEn: form.termsEn,
          termsUr: form.termsUr,
          buyerPhone: form.buyerPhone,
          buyerName: form.buyerName,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Failed to record sale");
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
      <ShopTopBar title="Record sale & warranty" subtitle={`Step ${step + 1} of 4 · ${STEPS[step]}`} />
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
              <p className="font-semibold text-[var(--text-primary)]">Sale sealed & warranty sent</p>
              <p className="mt-1 font-mono text-sm">{success.code}</p>
              <div className="mt-4 flex justify-center rounded-2xl bg-white p-4">
                <QrDisplay
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify?code=${encodeURIComponent(success.code)}`}
                  size={160}
                />
              </div>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => {
                  setSuccess(null);
                  setStep(0);
                  setForm({
                    ...form,
                    stockItemId: "",
                    productName: "",
                    serialImei: "",
                    purchaseAmount: "",
                    paymentReference: "",
                    paperPhotoHash: "",
                    paperPhotoName: "",
                    buyerPhone: "",
                    buyerName: "",
                  });
                }}
              >
                Record another sale
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
                    <p className="text-xs text-[var(--text-muted)]">
                      Buyer must be registered in the app (phone number).
                    </p>
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
                    {inventory.length > 0 && (
                      <div>
                        <label className="label-field">Pick from inventory (optional)</label>
                        <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                          {inventory.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => selectStock(item)}
                              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                                form.stockItemId === item.id
                                  ? "border-[var(--accent)] bg-[var(--pastel-mint)]"
                                  : "border-[var(--border)] bg-[var(--bg-elevated)]"
                              }`}
                            >
                              <span className="font-medium">{item.productName}</span>
                              {item.serialImei && (
                                <span className="ml-2 font-mono text-xs text-[var(--text-muted)]">
                                  {item.serialImei}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <Input
                      label="Product name"
                      required
                      value={form.productName}
                      onChange={(e) => setForm({ ...form, productName: e.target.value, stockItemId: "" })}
                    />
                    <Input
                      label="Serial / IMEI"
                      value={form.serialImei}
                      onChange={(e) => setForm({ ...form, serialImei: e.target.value })}
                    />
                    <PtaImeiCheckLink imei={form.serialImei} />
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
                  <>
                    <Input
                      label="Sale amount (PKR)"
                      required
                      type="number"
                      min="1"
                      value={form.purchaseAmount}
                      onChange={(e) => setForm({ ...form, purchaseAmount: e.target.value })}
                    />
                    <div>
                      <label className="label-field">Payment method</label>
                      <select
                        className="input-field"
                        value={form.paymentMethod}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(form.paymentMethod === "RAAST" || form.paymentMethod === "CARD") && (
                      <Input
                        label="Payment reference"
                        required={form.paymentMethod === "RAAST"}
                        value={form.paymentReference}
                        onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
                        placeholder="Raast ID or transaction ref"
                      />
                    )}
                    <div>
                      <label className="label-field">Paper warranty card photo (optional)</label>
                      <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]">
                        <Camera className="h-4 w-4" />
                        {hashingPhoto
                          ? "Hashing photo…"
                          : form.paperPhotoName
                            ? `Sealed: ${form.paperPhotoName}`
                            : "Take or upload photo — stored as SHA-256 only"}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => void onPaperPhoto(e.target.files?.[0] ?? null)}
                        />
                      </label>
                      {form.paperPhotoHash && (
                        <p className="mt-1 font-mono text-[10px] text-[var(--text-tertiary)]">
                          {form.paperPhotoHash.slice(0, 24)}…
                        </p>
                      )}
                    </div>
                  </>
                )}
                {step === 3 && (
                  <div className="space-y-2 text-sm text-[var(--text-muted)]">
                    <p>
                      <strong className="text-[var(--text-primary)]">Buyer:</strong> {form.buyerName} ·{" "}
                      {form.buyerPhone}
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Product:</strong> {form.productName}
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Sale:</strong> PKR{" "}
                      {parseFloat(form.purchaseAmount).toLocaleString("en-PK")} ·{" "}
                      {PAYMENT_METHODS.find((m) => m.value === form.paymentMethod)?.label}
                    </p>
                    <p>
                      <strong className="text-[var(--text-primary)]">Duration:</strong> {form.durationMonths}{" "}
                      months
                    </p>
                    {form.paperPhotoHash && (
                      <p className="text-xs text-[var(--accent)]">Paper card photo hash included in seal</p>
                    )}
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
                  {step < 3 ? (
                    <Button
                      className="flex-1"
                      disabled={!canAdvance()}
                      onClick={() => setStep(step + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button className="flex-1" loading={loading} onClick={() => void submit()}>
                      Seal sale & send warranty
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </Card>
        <Link href="/shop/stock" className="btn-ghost mt-4 block text-center text-xs">
          View inventory from brand
        </Link>
        <Link href="/shop/policies" className="btn-ghost mt-2 block text-center text-xs">
          Manage policy templates
        </Link>
      </main>
      <ShopBottomNav />
    </div>
  );
}
