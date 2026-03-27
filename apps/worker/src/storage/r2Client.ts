import { S3Client } from "@aws-sdk/client-s3";

/**
 * AWS SDK v3 client configured for Cloudflare R2.
 * In local dev (docker-compose) this points to MinIO.
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT ?? `https://${process.env.R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  // For local MinIO: force path-style addressing
  forcePathStyle: process.env.NODE_ENV !== "production",
});
