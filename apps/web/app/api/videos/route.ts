import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { db, videos, desc, eq } from "@vibe3/db";

// GET /api/videos — list current user's videos
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        status: videos.status,
        manifestUrl: videos.manifestUrl,
        thumbnailUrl: videos.thumbnailUrl,
        durationSec: videos.durationSec,
        createdAt: videos.createdAt,
      })
      .from(videos)
      .where(eq(videos.userId, user.id))
      .orderBy(desc(videos.createdAt))
      .limit(100);

    return NextResponse.json({ videos: data });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
