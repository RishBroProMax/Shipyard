import { NextRequest } from "next/server";
import { subscribeToLogs, getLogs } from "@/lib/agent/executor";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const deploymentId = params.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send existing logs first
      const existing = getLogs(deploymentId);
      if (existing) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ log: existing })}\n\n`));
      }

      // Subscribe to real-time additions
      const unsubscribe = subscribeToLogs(deploymentId, (chunk) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ log: chunk })}\n\n`));
        } catch {
          unsubscribe();
        }
      });

      // Cleanup when client disconnects
      req.signal.addEventListener("abort", () => {
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
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
