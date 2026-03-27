-- Seed data for local development
-- Run after migrations: supabase db reset

-- NOTE: auth.users rows are created by Supabase Auth.
-- Use the Supabase Studio UI or supabase auth admin to create a test user,
-- then replace the UUID below with that user's ID.

-- Example seed video records (status READY — skip worker for UI dev)
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000001'::uuid; -- replace with real user ID
BEGIN
  INSERT INTO public.videos (id, user_id, title, description, status, manifest_url, thumbnail_url, duration_sec, width_px, height_px)
  VALUES
    (
      gen_random_uuid(),
      test_user_id,
      'Big Buck Bunny',
      'Open-source animated short — perfect for HLS testing.',
      'READY',
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', -- public test stream
      NULL,
      597,
      1920,
      1080
    ),
    (
      gen_random_uuid(),
      test_user_id,
      'Processing Demo',
      'Video currently being processed.',
      'PROCESSING',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL
    ),
    (
      gen_random_uuid(),
      test_user_id,
      'Failed Upload',
      'Transcoding error demo.',
      'FAILED',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL
    );
END $$;
