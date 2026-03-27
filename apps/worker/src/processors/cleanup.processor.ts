import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { Processor } from "bullmq";
import type { CleanupJobData } from "@vibe3/queue";
import { r2Client } from "../storage/r2Client.js";

export const cleanupProcessor: Processor<CleanupJobData> = async (job) => {
  const { rawKey } = job.data;

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: rawKey,
    })
  );

  console.info(`[cleanup] Deleted raw file from R2: ${rawKey}`);
};
