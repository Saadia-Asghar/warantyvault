"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    stats: Record<string, number>;
    recentFraud: Array<{ serialImei: string; reason: string; shop?: { shopName: string } }>;
  } | null>(null);
  const [complaints, setComplaints] = useState<
    Array<{ id: string; subject: string; name: string; email: string; status: string; createdAt: string }>
  >([]);
  const [emails, setEmails] = useState<
    Array<{ id: string; to: string; subject: string; status: string; createdAt: string }>
  >([]);
  const [audit, setAudit] = useState<
    Array<{ eventType: string; eventHash: string; createdAt: string }>
  >([]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setData(j.data);
      });
    fetch("/api/admin/complaints")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setComplaints(j.data);
      });
    fetch("/api/admin/emails")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setEmails(j.data);
      });
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setAudit(j.data);
      });
  }, []);

  async function resolveComplaint(id: string) {
    await fetch("/api/admin/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "RESOLVED" }),
    });
    setComplaints((c) => c.map((x) => (x.id === id ? { ...x, status: "RESOLVED" } : x)));
  }

  function exportAudit() {
    const csv = ["eventType,eventHash,createdAt", ...audit.map((e) => `${e.eventType},${e.eventHash},${e.createdAt}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "warrantyvault-audit.csv";
    a.click();
  }

  const statEntries = data ? Object.entries(data.stats) : [];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <Navbar role="admin" name="Admin" />
      <div className="mx-auto flex max-w-2xl justify-end px-4 py-2">
        <ThemeToggle />
      </div>
      <main className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl">
        <div className="summary-card">
          <p className="text-sm text-[var(--text-muted)]">Platform overview</p>
          <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">
            {data?.stats.warranties ?? "—"}
          </p>
          <p className="mt-2 text-sm text-[var(--accent)]">
            warranties · {data?.stats.shops ?? "—"} shops · {data?.stats.claims ?? "—"} claims
          </p>
        </div>

        <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Complaints inbox
        </h2>
        <div className="activity-feed">
          {complaints.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">No complaints</div>
          ) : (
            complaints.map((c) => (
              <div key={c.id} className="border-b border-[var(--border)] p-4 last:border-b-0">
                <p className="font-medium text-[var(--text-primary)]">{c.subject}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {c.name} · {c.email} · {formatDate(c.createdAt)}
                </p>
                <p className="mt-1 text-xs text-[var(--accent)]">{c.status}</p>
                {c.status === "OPEN" && (
                  <button
                    type="button"
                    className="btn-secondary btn-primary-sm mt-2"
                    onClick={() => void resolveComplaint(c.id)}
                  >
                    Mark resolved
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Audit log
          </h2>
          <button type="button" onClick={exportAudit} className="btn-ghost text-xs">
            Export CSV
          </button>
        </div>
        <div className="activity-feed mt-2 max-h-48 overflow-y-auto">
          {audit.slice(0, 20).map((e) => (
            <div key={e.eventHash} className="activity-row text-xs">
              <span className="text-[var(--text-primary)]">{e.eventType}</span>
              <span className="ml-auto text-[var(--text-tertiary)]">{formatDate(e.createdAt)}</span>
            </div>
          ))}
        </div>

        <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Email log
        </h2>
        <div className="activity-feed max-h-40 overflow-y-auto">
          {emails.slice(0, 15).map((e) => (
            <div key={e.id} className="activity-row text-xs">
              <span className="truncate text-[var(--text-muted)]">{e.subject}</span>
              <span className="ml-auto shrink-0 text-[var(--text-tertiary)]">{e.status}</span>
            </div>
          ))}
        </div>

        <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Fraud flags
        </h2>
        <div className="activity-feed">
          {data?.recentFraud.length ? (
            data.recentFraud.map((f, i) => (
              <div key={i} className="activity-row">
                <div className="activity-icon">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-[var(--text-primary)]">{f.serialImei}</p>
                  <p className="text-xs text-[var(--text-muted)]">{f.reason}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">No fraud flags</div>
          )}
        </div>

        {statEntries.length > 0 && (
          <>
            <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              All metrics
            </h2>
            <div className="activity-feed">
              {statEntries.map(([k, v]) => (
                <div key={k} className="activity-row">
                  <span className="text-sm capitalize text-[var(--text-muted)]">
                    {k.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="ml-auto text-lg font-semibold text-[var(--text-primary)]">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
