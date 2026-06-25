"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function AdminAuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error);
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <header className="border-b border-[var(--border)] px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)]">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </header>
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="activity-icon">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Platform admin</h1>
        </div>
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
            <p className="text-center text-xs">
              <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
                Forgot password?
              </Link>
            </p>
          </form>
        </Card>
      </main>
    </div>
  );
}
