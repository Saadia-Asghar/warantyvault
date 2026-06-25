"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { requestNotificationPermission } from "@/lib/browser-notify";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from(Array.from(raw, (c) => c.charCodeAt(0)));
}

export function PushNotificationsBanner() {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") {
      setEnabled(true);
      return;
    }
    if (Notification.permission === "default" && !sessionStorage.getItem("wv_push_dismissed")) {
      setVisible(true);
    }
  }, []);

  async function enable() {
    setLoading(true);
    try {
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        setVisible(false);
        sessionStorage.setItem("wv_push_dismissed", "1");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidRes = await fetch("/api/push/vapid-key");
      const vapidJson = await vapidRes.json();
      const publicKey = vapidJson.data?.publicKey as string | null;

      if (publicKey) {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        const json = sub.toJSON();
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
          }),
        });
      }

      setEnabled(true);
      setVisible(false);
    } finally {
      setLoading(false);
    }
  }

  function dismiss() {
    sessionStorage.setItem("wv_push_dismissed", "1");
    setVisible(false);
  }

  if (!visible || enabled) return null;

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <Bell className="h-4 w-4 shrink-0 text-[var(--accent)]" />
        <p className="flex-1 text-xs text-[var(--text-muted)]">
          Enable notifications for chat replies and warranty reminders.
        </p>
        <button
          type="button"
          onClick={() => void enable()}
          disabled={loading}
          className="btn-primary btn-primary-sm shrink-0 text-xs"
        >
          Enable
        </button>
        <button type="button" onClick={dismiss} className="shrink-0 p-1 text-[var(--text-tertiary)]" aria-label="Dismiss">
          <BellOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
