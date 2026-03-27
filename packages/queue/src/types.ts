// ---------------------------------------------------------------------------
// Job Data Interfaces — shared contract between apps/web (producer)
// and apps/worker (consumer). Changing these types affects both sides.
// ---------------------------------------------------------------------------

export type JobPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

export interface TranscodingJobData {
  /** UUID of the video record in the `videos` table */
  videoId: string;
  /** UUID of the project */
  projectId: string;
  /** R2 key of the uploaded raw file, e.g. "raw/abc123/video.mp4" */
  rawKey: string;
  /** Supabase user ID — used for authorization within the worker */
  userId: string;
  /** Job priority determines which queue tier this job goes into */
  priority: JobPriority;
}

export interface CleanupJobData {
  /** UUID of the video — used to derive the rawKey for deletion */
  videoId: string;
  /** Exact R2 key to delete after successful transcoding */
  rawKey: string;
}

export interface ClippingJobData {
  /** UUID of the new video record (the clip) */
  videoId: string;
  /** UUID of the source video record */
  sourceVideoId: string;
  /** UUID of the project */
  projectId: string;
  /** Start time in milliseconds */
  trimStart: number;
  /** End time in milliseconds */
  trimEnd: number;
  /** Playback speed (e.g. "0.5", "1.0", "2.0") */
  speed: string;
  /** Supabase user ID */
  userId: string;
}

// ---------------------------------------------------------------------------
// Queue names — single source of truth to avoid typos
// ---------------------------------------------------------------------------
export const QUEUE_NAMES = {
  TRANSCODING: "transcoding",
  CLEANUP: "cleanup",
  CLIPPING: "clipping",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
