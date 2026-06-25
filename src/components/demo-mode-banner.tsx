"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import { isDemoSession } from "@/lib/demo";
import { BRAND } from "@/lib/copy";

export function DemoModeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && isDemoSession(j.data?.session)) setShow(true);
      })
      .catch(() => {});
  }, []);

  if (!show) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-200">
      <FlaskConical className="mr-1 inline h-3.5 w-3.5" aria-hidden />
      {BRAND.demoLabel}
    </div>
  );
}
