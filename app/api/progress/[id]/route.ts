import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { getProgress } from "@/lib/analysis/progressStore";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const POLL_MS = 500;
const MAX_MS = 120_000;

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isValidAnalysisId(id)) {
    return new Response(JSON.stringify({ error: "Invalid ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const startedAt = Date.now();

      try {
        while (Date.now() - startedAt < MAX_MS) {
          const stage = getProgress(id);
          const payload = JSON.stringify({ stage: stage ?? "" });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));

          if (stage === "complete") {
            controller.close();
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, POLL_MS));
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
