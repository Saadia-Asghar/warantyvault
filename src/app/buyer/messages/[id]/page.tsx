import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatThreadView } from "@/components/chat-thread";
import { BuyerBottomNav } from "@/components/buyer-bottom-nav";

export default async function BuyerThreadPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "buyer") redirect("/buyer/auth");

  return (
    <>
      <ChatThreadView
        threadId={params.id}
        role="buyer"
        userId={session.sub}
        backHref="/buyer/messages"
      />
      <BuyerBottomNav />
    </>
  );
}
