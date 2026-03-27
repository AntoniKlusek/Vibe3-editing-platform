import { db, videos } from "@vibe3/db";
import { eq } from "drizzle-orm";
import type { VideoStatus } from "@vibe3/db";

interface VideoUpdate {
  manifestUrl?: string;
  thumbnailUrl?: string;
  hlsBaseKey?: string;
  durationSec?: number;
  widthPx?: number;
  heightPx?: number;
  errorMessage?: string;
}

/**
 * Updates the status (and optional metadata) of a video record in Postgres.
 * Uses Drizzle ORM directly.
 */
export async function updateVideoStatus(
  videoId: string,
  status: VideoStatus,
  extra: VideoUpdate = {}
): Promise<void> {
  try {
    await db
      .update(videos)
      .set({
        status,
        manifestUrl: extra.manifestUrl,
        thumbnailUrl: extra.thumbnailUrl,
        hlsBaseKey: extra.hlsBaseKey,
        durationSec: extra.durationSec,
        widthPx: extra.widthPx,
        heightPx: extra.heightPx,
        errorMessage: extra.errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, videoId));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[db] Failed to update video ${videoId}: ${message}`);
  }
}

/**
 * Fetches a video record by its UUID.
 */
export async function getVideoById(videoId: string) {
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
  return video || null;
}
