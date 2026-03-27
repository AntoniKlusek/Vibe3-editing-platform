import "dotenv/config";
import { transcodingWorker } from "./queues/transcoding.queue.js";
import { cleanupWorker } from "./queues/cleanup.queue.js";
import { clippingWorker } from "./queues/clipping.queue.js";
import { startHealthServer } from "./server.js";

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
async function shutdown(signal: string) {
  console.info(`[worker] Received ${signal} — shutting down gracefully...`);
  await Promise.all([
    transcodingWorker.close(),
    cleanupWorker.close(),
    clippingWorker.close(),
  ]);
  console.info("[worker] All workers closed. Exiting.");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
async function main() {
  console.info("[worker] Starting Vibe3 Video Processing Worker...");

  // HTTP health check server (used by Docker HEALTHCHECK and K8s liveness probe)
  startHealthServer(3001);

  console.info(`[worker] Transcoding worker ready (concurrency: ${process.env.WORKER_CONCURRENCY ?? 2})`);
  console.info("[worker] Cleanup worker ready");
  console.info("[worker] Listening for jobs...");
}

main().catch((err) => {
  console.error("[worker] Fatal startup error:", err);
  process.exit(1);
});
