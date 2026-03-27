import { NextResponse } from "next/server";
import { transcodingQueue } from "@vibe3/queue";

/**
 * POST /api/webhooks/transcoding
 * Called by the client after a successful direct upload to R2.
 * Adds the video to the transcoding queue.
 *
 * Protected by a shared secret (WORKER_SECRET) to prevent unauthorized job injection.
 */
export async function POST(req: Request) {
  // Verify secret token
  const authHeader = req.headers.get("x-worker-secret");
  if (authHeader !== process.env.NEXT_PUBLIC_WORKER_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    videoId?: string;
    projectId?: string;
    rawKey?: string;
    userId?: string;
    priority?: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
  };

  const { videoId, projectId, rawKey, userId, priority = "NORMAL" } = body;

  if (!videoId || !projectId || !rawKey || !userId) {
    return NextResponse.json({ error: "videoId, projectId, rawKey, userId are required" }, { status: 400 });
  }

  const job = await transcodingQueue.add(
    "transcode",
    { videoId, projectId, rawKey, userId, priority },
    {
      // Higher priority values = processed first in BullMQ
      priority: priority === "CRITICAL" ? 1 : priority === "HIGH" ? 2 : priority === "LOW" ? 10 : 5,
    }
  );

  return NextResponse.json({ jobId: job.id, queued: true });
}
