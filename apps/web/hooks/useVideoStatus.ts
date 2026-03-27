"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VideoStatus } from "@vibe3/db";

/**
 * Subscribes to real-time status updates for a video using Supabase Realtime.
 * The component using this hook will re-render automatically when
 * the video's status changes in the database (e.g. PENDING → PROCESSING → READY).
 */
export function useVideoStatus(videoId: string, initialStatus: VideoStatus) {
  const [status, setStatus] = useState<VideoStatus>(initialStatus);
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`video-status-${videoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "videos",
          filter: `id=eq.${videoId}`,
        },
        (payload) => {
          const updated = payload.new as { status: VideoStatus; manifest_url?: string };
          setStatus(updated.status);
          if (updated.manifest_url) setManifestUrl(updated.manifest_url);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [videoId]);

  return { status, manifestUrl };
}
