"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed || !deferred) return null;

  return (
    <div className="border-b border-[var(--border)] bg-[var(--accent-muted)] px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <Download className="h-5 w-5 shrink-0 text-[var(--accent)]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">Install WarrantyVault</p>
          <p className="text-xs text-[var(--text-muted)]">Add to home screen — works like a mobile app</p>
        </div>
        <button
          type="button"
          className="btn-primary btn-primary-sm shrink-0"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
          }}
        >
          Install
        </button>
        <button
          type="button"
          className="text-xs text-[var(--text-muted)]"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
