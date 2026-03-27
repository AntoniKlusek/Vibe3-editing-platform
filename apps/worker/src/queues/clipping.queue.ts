import { Worker } from "bullmq";
import { redisConnection, QUEUE_NAMES, type ClippingJobData } from "@vibe3/queue";
import { clippingProcessor } from "../processors/clipping.processor.js";

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? 2);

export const clippingWorker = new Worker<ClippingJobData>(
  QUEUE_NAMES.CLIPPING,
  clippingProcessor,
  {
    connection: redisConnection as any,
    concurrency: CONCURRENCY,
  }
);

clippingWorker.on("completed", (job) => {
  console.info(`[clipping] Job ${job.id} completed — clipId: ${job.data.videoId}`);
});

clippingWorker.on("failed", (job, err) => {
  console.error(`[clipping] Job ${job?.id} failed — clipId: ${job?.data.videoId}`, err);
});
