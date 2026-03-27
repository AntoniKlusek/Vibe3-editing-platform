import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { db, videos, eq, and } from "@vibe3/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/videos/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, user.id)))
      .limit(1)
      .then(res => res[0]);

    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ video: data });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

// PATCH /api/videos/[id] — update title/description
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { title?: string; description?: string };

  try {
    const [data] = await db
      .update(videos)
      .set({ title: body.title, description: body.description, updatedAt: new Date() })
      .where(and(eq(videos.id, id), eq(videos.userId, user.id)))
      .returning();

    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ video: data });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

// DELETE /api/videos/[id]
export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const deleted = await db
      .delete(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, user.id)))
      .returning();

    if (deleted.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
