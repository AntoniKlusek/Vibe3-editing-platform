import { S3Client } from "@aws-sdk/client-s3";

/**
 * AWS SDK v3 S3 client configured for Cloudflare R2.
 * Used in server-side Route Handlers (presign generation).
 * In local dev (docker-compose) this points to MinIO on port 9000.
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint:
    process.env.R2_ENDPOINT ??
    `https://${process.env.R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: process.env.NODE_ENV !== "production", // required for MinIO
});
