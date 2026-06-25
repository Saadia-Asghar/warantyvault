"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { Shield } from "lucide-react";

type AuditEvent = {
  id: string;
  eventType: string;
  actorRole: string | null;
  payloadJson: string;
  eventHash: string;
  createdAt: string;
};

const labels: Record<string, string> = {
  WARRANTY_REGISTER: "Registered on registry",
  WARRANTY_TRANSFER: "Transferred to buyer",
  WARRANTY_REVOKE: "Revoked",
  CLAIM_OPEN: "Claim opened",
  CLAIM_UPDATE: "Claim updated",
  OUTLET_APPROVE: "Outlet approved",
  OUTLET_REJECT: "Outlet rejected",
  OUTLET_SUSPEND: "Outlet suspended",
};

export function AuditTimeline({ warrantyId }: { warrantyId: string }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/warranties/${warrantyId}/audit`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setEvents(j.data.events);
      })
      .finally(() => setLoading(false));
  }, [warrantyId]);

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading audit trail…</p>;
  if (events.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
        <Shield className="h-3.5 w-3.5" /> Registry audit trail
      </h2>
      <div className="activity-feed">
        {events.map((e) => (
          <div key={e.id} className="activity-row flex-col items-start gap-1 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {labels[e.eventType] ?? e.eventType}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {formatDate(e.createdAt)}
                {e.actorRole ? ` · ${e.actorRole}` : ""}
              </p>
            </div>
            <code className="max-w-full truncate font-mono text-[9px] text-[var(--text-tertiary)]">
              {e.eventHash.slice(0, 16)}…
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
