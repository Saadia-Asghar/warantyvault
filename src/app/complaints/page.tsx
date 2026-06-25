"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquareWarning } from "lucide-react";

export default function ComplaintsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        const session = j.data?.session;
        if (j.success && session) {
          setForm((f) => ({
            ...f,
            name: session.name ?? f.name,
            email: session.email ?? f.email,
            phone: session.phone ?? f.phone,
          }));
        }
      })
      .catch(() => undefined);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Could not submit complaint");
        return;
      }
      setSuccess(json.data.message);
      setForm((f) => ({ ...f, subject: "", message: "" }));
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
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="activity-icon">
            <MessageSquareWarning className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Submit a complaint</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Report to admin, or{" "}
              <Link href="/buyer/messages/new" className="text-[var(--accent)] underline">
                chat with a shopkeeper
              </Link>{" "}
              for a direct reply
            </p>
          </div>
        </div>

        <Card>
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Your name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email (for updates)"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Subject"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                Describe the issue
              </label>
              <textarea
                required
                minLength={10}
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
                placeholder="Warranty not showing, wrong outlet, fraud concern…"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-emerald-400">{success}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Submit complaint
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
            Every complaint is emailed to our support team and logged for follow-up.
          </p>
        </Card>
      </main>
    </div>
  );
}
