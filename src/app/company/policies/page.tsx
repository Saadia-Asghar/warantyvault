"use client";

import { useEffect, useState } from "react";
import { CompanyBottomNav } from "@/components/company-bottom-nav";
import { Navbar } from "@/components/navbar";
import { NotificationPanel } from "@/components/notification-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Policy = {
  id: string;
  name: string;
  category: string;
  policyType: string;
  durationMonths: number;
  termsEn: string;
  termsUr: string;
  exclusions: string;
};

export default function CompanyPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "MOBILE",
    policyType: "REPAIR_ONLY",
    durationMonths: 6,
    exclusions: "",
    termsEn: "",
    termsUr: "",
  });

  function load() {
    fetch("/api/company/policies")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setPolicies(j.data);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/company/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...form, name: "", termsEn: "", termsUr: "" });
    load();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <Navbar role="company" name="Policies" />
      <div className="border-b border-[var(--border)] px-4 py-2">
        <div className="mx-auto flex max-w-lg justify-end md:max-w-2xl">
          <NotificationPanel />
        </div>
      </div>
      <main className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl">
        <div className="activity-feed mb-6">
          {policies.map((p) => (
            <div key={p.id} className="activity-row flex-col items-start">
              <p className="font-medium text-[var(--text-primary)]">{p.name}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {p.durationMonths}mo · {p.policyType}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={create} className="panel space-y-3 p-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Add network policy</h2>
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Terms (EN)" required value={form.termsEn} onChange={(e) => setForm({ ...form, termsEn: e.target.value })} />
          <Textarea label="Terms (UR)" required value={form.termsUr} onChange={(e) => setForm({ ...form, termsUr: e.target.value })} />
          <Button type="submit" className="w-full">Save policy</Button>
        </form>
      </main>
      <CompanyBottomNav />
    </div>
  );
}
