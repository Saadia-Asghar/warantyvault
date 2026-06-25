"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound } from "lucide-react";
import { AUTH_PLACEHOLDERS } from "@/lib/form-placeholders";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Invalid reset link — request a new one.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Reset failed");
        return;
      }
      setMessage(json.data.message);
      setTimeout(() => router.push("/get-started"), 2000);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          required
          minLength={8}
          placeholder={AUTH_PLACEHOLDERS.password}
          hint="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm password"
          type="password"
          required
          minLength={8}
          placeholder={AUTH_PLACEHOLDERS.password}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Update password
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
        <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
          Request a new link
        </Link>
      </p>
    </Card>
  );
}

export default function ResetPasswordPage() {
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
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Set new password</h1>
            <p className="text-sm text-[var(--text-muted)]">Choose a strong password (8+ characters)</p>
          </div>
        </div>
        <Suspense fallback={<Card><p className="text-sm text-[var(--text-muted)]">Loading…</p></Card>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
