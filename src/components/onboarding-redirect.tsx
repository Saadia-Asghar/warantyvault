"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("wv_onboarded")) {
      router.replace("/onboarding");
    }
  }, [router]);

  return null;
}
