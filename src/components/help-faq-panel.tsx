"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle, MessageCircleQuestion, X } from "lucide-react";
import { FAQ_BY_ROLE, detectFaqRole, type FaqRole } from "@/lib/faq";
import { BRAND } from "@/lib/copy";

const ROLE_TABS: { id: FaqRole; label: string }[] = [
  { id: "general", label: "Overview" },
  { id: "buyer", label: "Buyer" },
  { id: "shop", label: "Shop" },
  { id: "company", label: "Brand" },
];

export function HelpFaqPanel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<FaqRole>("general");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<number | null>(0);

  useEffect(() => {
    if (open) setRole(detectFaqRole(pathname));
  }, [pathname, open]);

  const items = useMemo(() => {
    const list = [...FAQ_BY_ROLE.general, ...FAQ_BY_ROLE[role]];
    const seen = new Set<string>();
    const unique = list.filter((item) => {
      if (seen.has(item.q)) return false;
      seen.add(item.q);
      return true;
    });
    if (!query.trim()) return unique;
    const q = query.toLowerCase();
    return unique.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [role, query]);

  if (pathname.startsWith("/admin/auth") || pathname.startsWith("/get-started")) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg transition hover:scale-105 md:bottom-6"
        aria-label="Help and FAQ"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-[var(--border)] bg-[var(--bg-deep)] shadow-xl sm:rounded-2xl"
            role="dialog"
            aria-labelledby="faq-title"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5 text-[var(--accent)]" />
                <div>
                  <h2 id="faq-title" className="font-semibold text-[var(--text-primary)]">
                    How to use {BRAND.shortName}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">Quick answers — no chatbot, just guides</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[var(--border)] px-4 py-2">
              <input
                type="search"
                placeholder="Search help…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-field text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {ROLE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setRole(tab.id);
                      setExpanded(0);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      role === tab.id
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                  No matches — try another keyword or role tab.
                </p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={item.q} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)]"
                        onClick={() => setExpanded(expanded === i ? null : i)}
                      >
                        {item.q}
                        <span className="text-[var(--text-tertiary)]">{expanded === i ? "−" : "+"}</span>
                      </button>
                      {expanded === i && (
                        <p className="border-t border-[var(--border)] px-4 py-3 text-sm leading-relaxed text-[var(--text-muted)]">
                          {item.a}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-[var(--border)] px-4 py-3 text-center text-xs text-[var(--text-tertiary)]">
              Still stuck?{" "}
              <a href="/complaints" className="text-[var(--accent)] hover:underline">
                Contact support
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
