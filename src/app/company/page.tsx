"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ContextBanner } from "@/components/context-banner";
import { NotificationPanel } from "@/components/notification-panel";
import { CompanyBottomNav } from "@/components/company-bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ChevronRight, MapPin } from "lucide-react";

type Outlet = {
  id: string;
  shopName: string;
  city: string;
  sector: string | null;
  address: string;
  approvalStatus: string;
  outletCode: string | null;
  ownerName: string;
  phone: string;
};

export default function CompanyDashboardPage() {
  const [brandName, setBrandName] = useState("Brand HQ");
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, suspended: 0 });
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  function load() {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (cityFilter) params.set("city", cityFilter);
    fetch(`/api/company/outlets?${params}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setOutlets(j.data.outlets);
          setStats(j.data.stats);
        }
      });
  }

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data?.session?.name) setBrandName(j.data.session.name);
      });
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, cityFilter]);

  async function act(outletId: string, action: "approve" | "reject" | "suspend") {
    setLoading(outletId);
    await fetch("/api/company/outlets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outletId, action }),
    });
    setLoading(null);
    load();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-24 md:pb-8">
      <Navbar role="company" name={brandName} />
      <ContextBanner role="company" />
      <div className="border-b border-[var(--border)] px-4 py-2">
        <div className="mx-auto flex max-w-lg justify-end md:max-w-2xl">
          <NotificationPanel />
        </div>
      </div>
      <main className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl">
        <div className="summary-card">
          <p className="text-sm text-[var(--text-muted)]">{brandName} network</p>
          <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{stats.approved} approved</p>
          <p className="mt-2 text-sm text-[var(--accent)]">
            {stats.total} outlets · {stats.pending} pending
            {stats.suspended > 0 ? ` · ${stats.suspended} suspended` : ""}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <select
            className="input-field max-w-[140px] py-2 text-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <input
            className="input-field max-w-[140px] py-2 text-xs"
            placeholder="Filter city"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
        </div>

        <h2 className="mb-2 mt-8 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Outlets
        </h2>

        <div className="activity-feed">
          {outlets.map((o) => (
            <div key={o.id}>
              <button
                type="button"
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="activity-row w-full text-left"
              >
                <div className="activity-icon">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--text-primary)]">{o.shopName}</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {o.sector ? `${o.sector}, ` : ""}
                    {o.city}
                  </p>
                </div>
                <Badge
                  variant={
                    o.approvalStatus === "APPROVED"
                      ? "active"
                      : o.approvalStatus === "PENDING"
                        ? "pending"
                        : "expired"
                  }
                >
                  {o.approvalStatus}
                </Badge>
                <ChevronRight
                  className={`h-5 w-5 text-[var(--text-tertiary)] transition ${expanded === o.id ? "rotate-90" : ""}`}
                />
              </button>

              {expanded === o.id && (
                <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-4 last:border-b-0">
                  <p className="text-xs text-[var(--text-muted)]">{o.address}</p>
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                    {o.ownerName} · {o.phone}
                  </p>
                  {o.outletCode && (
                    <p className="mt-2 font-mono text-xs text-[var(--accent)]">{o.outletCode}</p>
                  )}
                  {o.approvalStatus === "PENDING" && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        className="btn-primary-sm flex-1"
                        loading={loading === o.id}
                        onClick={() => act(o.id, "approve")}
                      >
                        Approve
                      </Button>
                      <Button variant="secondary" className="flex-1" onClick={() => act(o.id, "reject")}>
                        Reject
                      </Button>
                    </div>
                  )}
                  {o.approvalStatus === "APPROVED" && (
                    <Button
                      variant="danger"
                      className="mt-4 w-full"
                      onClick={() => act(o.id, "suspend")}
                    >
                      Suspend outlet
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
          {outlets.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-[var(--text-tertiary)]" />
              No outlets match your filters.
            </div>
          )}
        </div>
      </main>
      <CompanyBottomNav />
    </div>
  );
}
