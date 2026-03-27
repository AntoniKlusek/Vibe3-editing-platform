CREATE TYPE "public"."video_type" AS ENUM('SOURCE', 'CLIP');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "video_type" "video_type" DEFAULT 'SOURCE' NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "source_video_id" uuid;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "trim_start" integer;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "trim_end" integer;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "playback_speed" text DEFAULT '1.0';
