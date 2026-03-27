"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

type UploadStatus = "idle" | "uploading" | "done" | "error";

/**
 * Manages the entire upload lifecycle:
 * 1. GET presigned URL from our API
 * 2. PUT file directly to R2 via XHR (for progress tracking)
 * 3. POST to webhook to enqueue the transcoding job
 */
export function useUpload() {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, projectId: string) => {
      setStatus("uploading");
      setProgress(0);
      setError(null);

      try {
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            title: file.name.replace(/\.[^.]+$/, ""),
            projectId,
          }),
        });

        if (!presignRes.ok) {
          const err = (await presignRes.json()) as { error: string };
          throw new Error(err.error);
        }

        const { videoId: id, presignedUrl, rawKey } = (await presignRes.json()) as {
          videoId: string;
          presignedUrl: string;
          rawKey: string;
        };

        setVideoId(id);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () =>
            xhr.status === 200
              ? resolve()
              : reject(new Error(`R2 upload failed: ${xhr.status}`));
          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        const webhookRes = await fetch("/api/webhooks/transcoding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-worker-secret": process.env.NEXT_PUBLIC_WORKER_SECRET ?? "",
          },
          body: JSON.stringify({
            videoId: id,
            projectId, // Added projectId
            rawKey,
            userId: "self",
            priority: "NORMAL",
          }),
        });

        if (!webhookRes.ok) throw new Error("Failed to enqueue transcoding job");

        setStatus("done");
        // Redirect back to project page after short delay
        setTimeout(() => router.push(`/projects/${projectId}`), 1500);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [router]
  );

  return { upload, status, progress, videoId, error };
}
