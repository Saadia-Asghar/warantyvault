"use client";

import { useEffect, useState } from "react";
import { ShopBottomNav } from "@/components/shop-bottom-nav";
import { ShopTopBar } from "@/components/shop-top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Policy = {
  id: string;
  name: string;
  durationMonths: number;
  policyType: string;
};

export default function ShopPoliciesPage() {
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
    fetch("/api/policies")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setPolicies(j.data.shopPolicies ?? j.data ?? []);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    load();
  }

  async function remove(id: string) {
    await fetch("/api/policies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24">
      <ShopTopBar title="Policy templates" />
      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="activity-feed mb-6">
          {policies.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-[var(--border)] p-4 last:border-b-0">
              <div>
                <p className="font-medium text-[var(--text-primary)]">{p.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {p.durationMonths}mo · {p.policyType}
                </p>
              </div>
              <button type="button" className="text-xs text-red-500" onClick={() => void remove(p.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={create} className="panel space-y-3 p-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Terms EN" required value={form.termsEn} onChange={(e) => setForm({ ...form, termsEn: e.target.value })} />
          <Textarea label="Terms UR" required value={form.termsUr} onChange={(e) => setForm({ ...form, termsUr: e.target.value })} />
          <Button type="submit" className="w-full">Add template</Button>
        </form>
      </main>
      <ShopBottomNav />
    </div>
  );
}
