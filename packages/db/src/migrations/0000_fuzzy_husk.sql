CREATE TYPE "public"."video_status" AS ENUM('PENDING', 'PROCESSING', 'READY', 'FAILED');--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "video_status" DEFAULT 'PENDING' NOT NULL,
	"error_message" text,
	"raw_key" text,
	"hls_base_key" text,
	"manifest_url" text,
	"thumbnail_url" text,
	"duration_sec" integer,
	"width_px" integer,
	"height_px" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
