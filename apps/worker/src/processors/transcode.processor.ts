import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import type { Processor } from "bullmq";
import type { TranscodingJobData } from "@vibe3/queue";
import { cleanupQueue } from "@vibe3/queue";
import { downloadFromR2 } from "../storage/downloader.js";
import { uploadHlsToR2 } from "../storage/uploader.js";
import { transcodeToHls } from "../ffmpeg/transcoder.js";
import { extractThumbnail } from "../ffmpeg/thumbnail.js";
import { probeVideo } from "../ffmpeg/probe.js";
import { updateVideoStatus } from "../db.js";

export const transcodeProcessor: Processor<TranscodingJobData> = async (job) => {
  const { videoId, projectId, rawKey } = job.data;
  const tmpDir = process.env.WORKER_TMP_DIR ?? os.tmpdir();
  const workDir = path.join(tmpDir, `video-${videoId}-${Date.now()}`);

  await fs.mkdir(workDir, { recursive: true });

  try {
    // ── Step 1: Mark as PROCESSING ────────────────────────────────────────
    console.info(`[transcode] Starting job for video ${videoId} — workDir: ${workDir}`);
    await updateVideoStatus(videoId, "PROCESSING");
    await job.updateProgress(5);

    // ── Step 2: Download raw file from R2 ─────────────────────────────────
    const inputPath = path.join(workDir, "input.mp4");
    console.info(`[transcode] Downloading ${rawKey} to ${inputPath}`);
    await downloadFromR2(rawKey, inputPath);
    await job.updateProgress(20);

    // ── Step 3: Probe video metadata (duration, resolution) ───────────────
    const probeData = await probeVideo(inputPath);
    await job.updateProgress(25);

    // ── Step 4: Transcode to HLS (2-second segments) ──────────────────────
    const hlsDir = path.join(workDir, "hls");
    await fs.mkdir(hlsDir);
    const { manifestPath, segmentPaths } = await transcodeToHls({
      inputPath,
      outputDir: hlsDir,
      segmentDuration: 2,
    });
    await job.updateProgress(75);

    // ── Step 5: Extract thumbnail ─────────────────────────────────────────
    const thumbnailPath = path.join(workDir, "thumbnail.jpg");
    await extractThumbnail(inputPath, thumbnailPath, 5);
    await job.updateProgress(80);

    // ── Step 6: Upload HLS segments + manifest + thumbnail to R2 ──────────
    const hlsBaseKey = `projects/${projectId}/source/${videoId}/hls`;
    const { manifestUrl, thumbnailUrl } = await uploadHlsToR2({
      manifestPath,
      segmentPaths,
      thumbnailPath,
      hlsBaseKey,
    });
    await job.updateProgress(95);

    // ── Step 7: Mark as READY ─────────────────────────────────────────────
    await updateVideoStatus(videoId, "READY", {
      manifestUrl,
      thumbnailUrl,
      hlsBaseKey,
      durationSec: Math.round(probeData.durationSec),
      widthPx: probeData.widthPx,
      heightPx: probeData.heightPx,
    });
    await job.updateProgress(100);

    // ── Step 8: Cleanup Disabled ─────────────────────────────────────────
    // We no longer schedule cleanup for Master Assets to allow clipping.
    // await cleanupQueue.add("cleanup", { videoId, rawKey }, { delay: 60_000 });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateVideoStatus(videoId, "FAILED", { errorMessage: message });
    throw err; // Re-throw so BullMQ handles retry logic

  } finally {
    // Always clean up local temp files
    await fs.rm(workDir, { recursive: true, force: true });
  }
};
