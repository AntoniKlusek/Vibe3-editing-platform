import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import type { Processor } from "bullmq";
import type { ClippingJobData } from "@vibe3/queue";
import { downloadFromR2 } from "../storage/downloader.js";
import { uploadFileToR2, uploadHlsToR2 } from "../storage/uploader.js";
import { clipVideo } from "../ffmpeg/editor.js";
import { transcodeToHls } from "../ffmpeg/transcoder.js";
import { extractThumbnail } from "../ffmpeg/thumbnail.js";
import { probeVideo } from "../ffmpeg/probe.js";
import { updateVideoStatus, getVideoById } from "../db.js";

export const clippingProcessor: Processor<ClippingJobData> = async (job) => {
  const { videoId, sourceVideoId, projectId, trimStart, trimEnd, speed, userId } = job.data;
  const tmpDir = process.env.WORKER_TMP_DIR ?? os.tmpdir();
  const workDir = path.join(tmpDir, `clip-${videoId}-${Date.now()}`);

  await fs.mkdir(workDir, { recursive: true });

  try {
    // ── Step 1: Mark as PROCESSING ────────────────────────────────────────
    console.info(`[clipping] Starting job for clip ${videoId} from source ${sourceVideoId}`);
    await updateVideoStatus(videoId, "PROCESSING");

    // ── Step 2: Get Source Video rawKey ───────────────────────────────────
    const sourceVideo = await getVideoById(sourceVideoId);
    if (!sourceVideo || !sourceVideo.rawKey) {
      throw new Error(`Source video ${sourceVideoId} not found or missing rawKey`);
    }

    // ── Step 3: Download source file ──────────────────────────────────────
    const srcInputPath = path.join(workDir, "source.mp4");
    await downloadFromR2(sourceVideo.rawKey, srcInputPath);
    await job.updateProgress(20);

    // ── Step 4: Run FFmpeg to create clip ─────────────────────────────────
    const clipOutputPath = path.join(workDir, "clip.mp4");
    await clipVideo({
      inputPath: srcInputPath,
      outputPath: clipOutputPath,
      startTimeMs: trimStart,
      endTimeMs: trimEnd,
      speed: parseFloat(speed),
    });
    await job.updateProgress(50);

    // Path: projects/{projectId}/clips/{videoId}/clip_raw.mp4
    const rawKey = `projects/${projectId}/clips/${videoId}/clip_raw.mp4`;
    await uploadFileToR2(clipOutputPath, rawKey);
    await job.updateProgress(60);

    // ── Step 6: Transcode clip to HLS ─────────────────────────────────────
    const hlsDir = path.join(workDir, "hls");
    await fs.mkdir(hlsDir);
    const { manifestPath, segmentPaths } = await transcodeToHls({
      inputPath: clipOutputPath,
      outputDir: hlsDir,
      segmentDuration: 2,
    });

    const thumbnailPath = path.join(workDir, "thumbnail.jpg");
    await extractThumbnail(clipOutputPath, thumbnailPath, 0); // Grab first frame of the clip

    const hlsBaseKey = `projects/${projectId}/clips/${videoId}/hls`;
    const { manifestUrl, thumbnailUrl } = await uploadHlsToR2({
      manifestPath,
      segmentPaths,
      thumbnailPath,
      hlsBaseKey,
    });
    await job.updateProgress(90);

    // ── Step 7: Finalize database ─────────────────────────────────────────
    const probeData = await probeVideo(clipOutputPath);
    await updateVideoStatus(videoId, "READY", {
      manifestUrl,
      thumbnailUrl,
      hlsBaseKey,
      durationSec: Math.round(probeData.durationSec),
      widthPx: probeData.widthPx,
      heightPx: probeData.heightPx,
    });
    await job.updateProgress(100);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateVideoStatus(videoId, "FAILED", { errorMessage: message });
    throw err;
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
};
