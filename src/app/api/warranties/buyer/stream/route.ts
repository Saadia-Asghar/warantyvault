import { getSession, requireRole } from "@/lib/auth";
import { buyerWalletFingerprint, getBuyerWalletData } from "@/lib/buyer-wallet-data";
import { syncExpiredWarranties } from "@/lib/warranty-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_MS = 3000;

export async function GET(req: Request) {
  const session = await getSession();
  if (!requireRole(session, "buyer")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let lastFingerprint = "";

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let interval: ReturnType<typeof setInterval> | null = null;

      const close = () => {
        if (closed) return;
        closed = true;
        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const push = async () => {
        if (closed) return;
        try {
          await syncExpiredWarranties();
          const data = await getBuyerWalletData(session);
          const fingerprint = buyerWalletFingerprint(data);
          if (fingerprint !== lastFingerprint) {
            lastFingerprint = fingerprint;
            controller.enqueue(
              encoder.encode(
                `event: wallet\ndata: ${JSON.stringify({ success: true, data })}\n\n`
              )
            );
          } else {
            controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
          }
        } catch {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ message: "sync_failed" })}\n\n`
            )
          );
        }
      };

      void push();
      interval = setInterval(() => void push(), POLL_MS);
      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
