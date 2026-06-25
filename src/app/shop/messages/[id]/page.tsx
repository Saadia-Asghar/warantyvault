import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatThreadView } from "@/components/chat-thread";
import { ShopBottomNav } from "@/components/shop-bottom-nav";

export default async function ShopThreadPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "shop") redirect("/shop/auth");

  return (
    <>
      <ChatThreadView
        threadId={params.id}
        role="shop"
        userId={session.sub}
        backHref="/shop/messages"
      />
      <ShopBottomNav />
    </>
  );
}
