import { Worker } from "bullmq";
import { redisConnection, QUEUE_NAMES, type CleanupJobData } from "@vibe3/queue";
import { cleanupProcessor } from "../processors/cleanup.processor.js";

export const cleanupWorker = new Worker<CleanupJobData>(
  QUEUE_NAMES.CLEANUP,
  cleanupProcessor,
  {
    connection: redisConnection as any,
    concurrency: 5, // cleanup is I/O-bound, can be higher
  }
);

cleanupWorker.on("completed", (job) => {
  console.info(`[cleanup] Deleted raw file rawKey: ${job.data.rawKey}`);
});

cleanupWorker.on("failed", (job, err) => {
  console.error(`[cleanup] Job ${job?.id} failed — rawKey: ${job?.data.rawKey}`, err.message);
});
