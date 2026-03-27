import { Worker } from "bullmq";
import { redisConnection, QUEUE_NAMES, type TranscodingJobData } from "@vibe3/queue";
import { transcodeProcessor } from "../processors/transcode.processor.js";

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? 2);

export const transcodingWorker = new Worker<TranscodingJobData>(
  QUEUE_NAMES.TRANSCODING,
  transcodeProcessor,
  {
    connection: redisConnection as any,
    concurrency: CONCURRENCY,
    limiter: {
      max: 10,        // Max 10 jobs processed per 10 seconds globally
      duration: 10_000,
    },
  }
);

transcodingWorker.on("completed", (job) => {
  console.info(`[transcoding] Job ${job.id} completed — videoId: ${job.data.videoId}`);
});

transcodingWorker.on("failed", (job, err) => {
  console.error(`[transcoding] Job ${job?.id} failed — videoId: ${job?.data.videoId}`, err);
  if (err.stack) console.error(err.stack);
});

transcodingWorker.on("error", (err) => {
  console.error("[transcoding] Worker error:", err);
});
