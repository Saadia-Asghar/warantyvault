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
  category: string;
  exclusions: string;
  termsEn: string;
  termsUr: string;
};

export default function ShopPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [editing, setEditing] = useState<Policy | null>(null);
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
    setForm({ ...form, name: "", termsEn: "", termsUr: "" });
    load();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await fetch("/api/policies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, ...form }),
    });
    setEditing(null);
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

  function startEdit(p: Policy) {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category as "MOBILE",
      policyType: p.policyType as "REPAIR_ONLY",
      durationMonths: p.durationMonths,
      exclusions: p.exclusions,
      termsEn: p.termsEn,
      termsUr: p.termsUr,
    });
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
              <div className="flex gap-2">
                <button type="button" className="text-xs text-[var(--accent)]" onClick={() => startEdit(p)}>
                  Edit
                </button>
                <button type="button" className="text-xs text-red-500" onClick={() => void remove(p.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={editing ? saveEdit : create} className="panel space-y-3 p-4">
          <h2 className="font-semibold text-[var(--text-primary)]">
            {editing ? "Edit template" : "Add template"}
          </h2>
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Terms EN" required value={form.termsEn} onChange={(e) => setForm({ ...form, termsEn: e.target.value })} />
          <Textarea label="Terms UR" required value={form.termsUr} onChange={(e) => setForm({ ...form, termsUr: e.target.value })} />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">{editing ? "Save changes" : "Add template"}</Button>
            {editing && (
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </main>
      <ShopBottomNav />
    </div>
  );
}
