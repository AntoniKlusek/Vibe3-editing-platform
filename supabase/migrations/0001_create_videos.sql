-- =============================================================================
-- Migration 0001: Create videos table
-- =============================================================================

CREATE TYPE video_status AS ENUM (
  'PENDING',
  'PROCESSING',
  'READY',
  'FAILED'
);

CREATE TABLE public.videos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  title          TEXT NOT NULL,
  description    TEXT,

  -- Processing
  status         video_status NOT NULL DEFAULT 'PENDING',
  error_message  TEXT,

  -- Storage keys (Cloudflare R2 / MinIO)
  raw_key        TEXT,         -- raw/{videoId}/filename.mp4
  hls_base_key   TEXT,         -- hls/{videoId}/

  -- Public URLs (populated after transcoding)
  manifest_url   TEXT,         -- https://cdn.../hls/{id}/index.m3u8
  thumbnail_url  TEXT,         -- https://cdn.../hls/{id}/thumbnail.jpg

  -- Video metadata (populated after ffprobe)
  duration_sec   INTEGER,
  width_px       INTEGER,
  height_px      INTEGER,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security — users can only see and modify their own videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own videos"
  ON public.videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Supabase Realtime on this table (for useVideoStatus hook)
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
