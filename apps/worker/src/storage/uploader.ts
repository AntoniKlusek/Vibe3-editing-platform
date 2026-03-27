import fs from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./r2Client.js";

const BUCKET = () => process.env.R2_BUCKET_NAME!;
const PUBLIC_BASE = () => process.env.R2_PUBLIC_URL!;
const BATCH = 10; // upload 10 segments in parallel

export interface UploadHlsOptions {
  manifestPath: string;
  segmentPaths: string[];
  thumbnailPath: string;
  hlsBaseKey: string;  // e.g. "hls/abc-123"
}

export interface UploadHlsResult {
  manifestUrl: string;
  thumbnailUrl: string;
}

/**
 * Uploads all HLS segments (in batches), the manifest, and the thumbnail to R2.
 * Segments use immutable cache headers; manifest uses short TTL.
 */
export async function uploadHlsToR2(opts: UploadHlsOptions): Promise<UploadHlsResult> {
  const { manifestPath, segmentPaths, thumbnailPath, hlsBaseKey } = opts;

  // ── Upload segments in parallel batches ───────────────────────────────────
  for (let i = 0; i < segmentPaths.length; i += BATCH) {
    const batch = segmentPaths.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (segPath) => {
        const key = `${hlsBaseKey}/${path.basename(segPath)}`;
        await r2Client.send(
          new PutObjectCommand({
            Bucket: BUCKET(),
            Key: key,
            Body: await fs.readFile(segPath),
            ContentType: "video/MP2T",
            CacheControl: "public, max-age=31536000, immutable",
          })
        );
      })
    );
  }

  // ── Upload thumbnail ───────────────────────────────────────────────────────
  const thumbKey = `${hlsBaseKey}/thumbnail.jpg`;
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET(),
      Key: thumbKey,
      Body: await fs.readFile(thumbnailPath),
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=86400",
    })
  );

  // ── Upload manifest last (after all segments are live) ────────────────────
  const manifestKey = `${hlsBaseKey}/index.m3u8`;
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET(),
      Key: manifestKey,
      Body: await fs.readFile(manifestPath),
      ContentType: "application/vnd.apple.mpegurl",
      CacheControl: "public, max-age=30, stale-while-revalidate=60",
    })
  );

  const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  return {
    manifestUrl: `${baseUrl}/${manifestKey}`,
    thumbnailUrl: `${baseUrl}/${thumbKey}`,
  };
}

/**
 * Generic helper to upload a single file to R2.
 */
export async function uploadFileToR2(localPath: string, key: string): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      Body: await fs.readFile(localPath),
      ContentType: "video/mp4", // Default to mp4 for clipping
      CacheControl: "public, max-age=86400",
    })
  );
  return `${PUBLIC_BASE()}/${key}`;
}
