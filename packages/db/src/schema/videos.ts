import { pgTable, uuid, text, pgEnum, integer, timestamp } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const videoStatusEnum = pgEnum("video_status", [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);

export const videoTypeEnum = pgEnum("video_type", ["SOURCE", "CLIP"]);

// ---------------------------------------------------------------------------
// videos table
// ---------------------------------------------------------------------------
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  projectId: uuid("project_id"), // Optional for now, but will be required in the UI

  // Metadata
  title: text("title").notNull(),
  description: text("description"),
  videoType: videoTypeEnum("video_type").notNull().default("SOURCE"),

  // Processing status
  status: videoStatusEnum("status").notNull().default("PENDING"),
  errorMessage: text("error_message"),

  // Clipping controls (for videoType === 'CLIP')
  sourceVideoId: uuid("source_video_id"),
  trimStart: integer("trim_start"), // ms
  trimEnd: integer("trim_end"),     // ms
  playbackSpeed: text("playback_speed").default("1.0"), // Store as string for precision, or use decimal

  // Storage keys (Cloudflare R2)
  rawKey: text("raw_key"),         // projects/{projectId}/source/{videoId}/filename.mp4
  hlsBaseKey: text("hls_base_key"), // projects/{projectId}/hls/{videoId}/

  // Public URLs
  manifestUrl: text("manifest_url"),
  thumbnailUrl: text("thumbnail_url"),

  // Video metadata (populated after ffprobe)
  durationSec: integer("duration_sec"),
  widthPx: integer("width_px"),
  heightPx: integer("height_px"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// TypeScript types inferred from schema
// ---------------------------------------------------------------------------
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type VideoStatus = (typeof videoStatusEnum.enumValues)[number];
export type VideoType = (typeof videoTypeEnum.enumValues)[number];
