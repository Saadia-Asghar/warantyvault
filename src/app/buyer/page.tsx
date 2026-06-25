import { getSession } from "@/lib/auth";
import { BuyerWalletClient } from "@/components/buyer-wallet";
import { redirect } from "next/navigation";

export default async function BuyerWalletPage() {
  const session = await getSession();
  if (!session || session.role !== "buyer") redirect("/buyer/auth");

  return <BuyerWalletClient name={session.name ?? "Customer"} />;
}
