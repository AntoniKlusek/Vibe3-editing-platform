import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { QUEUE_NAMES, type TranscodingJobData, type CleanupJobData, type ClippingJobData } from "./types.ts";

// ---------------------------------------------------------------------------
// Shared Redis connection  (maxRetriesPerRequest: null is required by BullMQ)
// ---------------------------------------------------------------------------
export const redisConnection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// ---------------------------------------------------------------------------
// Queue instances — import these in apps/web to add jobs
// ---------------------------------------------------------------------------
export const transcodingQueue = new Queue<TranscodingJobData>(QUEUE_NAMES.TRANSCODING, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: { count: 1_000 },
    removeOnFail: { count: 5_000 },
  },
});

export const cleanupQueue = new Queue<CleanupJobData>(QUEUE_NAMES.CLEANUP, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "fixed", delay: 10_000 },
  },
});

export const clippingQueue = new Queue<ClippingJobData>(QUEUE_NAMES.CLIPPING, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5_000 },
  },
});
