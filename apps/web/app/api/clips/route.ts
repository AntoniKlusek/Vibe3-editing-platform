import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { db, videos } from "@vibe3/db";
import { clippingQueue } from "@vibe3/queue";

export async function POST(req: Request) {
  const { sourceVideoId, trimStart, trimEnd, speed, title, projectId } = await req.json();
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000000";

  try {
    const [clip] = await db.insert(videos).values({
      userId,
      projectId,
      sourceVideoId,
      title,
      videoType: "CLIP",
      trimStart,
      trimEnd,
      playbackSpeed: String(speed),
      status: "PENDING",
    }).returning();

    if (!clip) throw new Error("Failed to create clip record");

    await clippingQueue.add("clipping", {
      videoId: clip.id,
      sourceVideoId,
      projectId,
      trimStart,
      trimEnd,
      speed: String(speed),
      userId,
    });

    return NextResponse.json({ clip });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create clip" }, { status: 500 });
  }
}
