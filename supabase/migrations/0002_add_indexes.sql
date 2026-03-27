-- =============================================================================
-- Migration 0002: Performance indexes
-- =============================================================================

-- Dashboard query: list videos by user, ordered by creation date
CREATE INDEX CONCURRENTLY idx_videos_user_created
  ON public.videos (user_id, created_at DESC);

-- Status filter (e.g. "show only READY videos")
CREATE INDEX CONCURRENTLY idx_videos_user_status
  ON public.videos (user_id, status);

-- Partial index: only READY videos (most frequent playback query)
CREATE INDEX CONCURRENTLY idx_videos_ready
  ON public.videos (user_id, created_at DESC)
  WHERE status = 'READY';
