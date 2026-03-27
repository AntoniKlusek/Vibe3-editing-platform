import fs from "node:fs";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./r2Client.js";
import type { Readable } from "node:stream";

/**
 * Downloads a file from Cloudflare R2 (or local MinIO) to a local path.
 */
export async function downloadFromR2(key: string, destPath: string): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME!;
  console.info(`[storage] Downloading from bucket: ${bucket}, key: ${key}`);
  
  const response = await r2Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );

  if (!response.Body) {
    throw new Error(`Empty response body for key: ${key}`);
  }

  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(destPath);
    (response.Body as Readable).pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
}
