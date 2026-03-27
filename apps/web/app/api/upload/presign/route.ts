import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { r2Client } from "@/lib/r2/client";
import { db, videos } from "@vibe3/db";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    filename?: unknown;
    contentType?: unknown;
    title?: unknown;
    projectId?: unknown;
  };
  const { filename, contentType, title, projectId } = body;

  if (!filename || typeof filename !== "string" || !contentType || typeof contentType !== "string") {
    return NextResponse.json({ error: "filename and contentType are required" }, { status: 400 });
  }

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const ALLOWED_TYPES = [
    "video/mp4",
    "video/quicktime",
    "video/x-matroska",
    "video/x-msvideo",
    "video/webm",
  ];
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const videoId = crypto.randomUUID();
  const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  // NEW HIERARCHY: projects/{projectId}/source/{videoId}/{safeFilename}
  const rawKey = `projects/${projectId}/source/${videoId}/${safeFilename}`;

  const presignedUrl = await getSignedUrl(
    r2Client,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: rawKey,
      ContentType: contentType,
    }),
    { expiresIn: Number(process.env.PRESIGNED_URL_EXPIRY ?? 900) }
  );

  try {
    await db.insert(videos).values({
      id: videoId,
      userId: user.id,
      projectId: projectId,
      title: typeof title === "string" ? title : filename,
      rawKey: rawKey,
      status: "PENDING",
      videoType: "SOURCE",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to create video record" }, { status: 500 });
  }

  return NextResponse.json({ videoId, presignedUrl, rawKey });
}
