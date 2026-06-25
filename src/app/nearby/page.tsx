import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { NearbyShopsClient } from "@/components/nearby-shops";

export default async function NearbyPage() {
  const session = await getSession();
  if (session && session.role !== "buyer") {
    redirect(
      session.role === "shop" ? "/shop" : session.role === "company" ? "/company" : "/admin"
    );
  }

  return <NearbyShopsClient />;
}
