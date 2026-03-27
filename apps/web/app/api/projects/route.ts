import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { db, projects, desc, eq } from "@vibe3/db";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === "00000000-0000-0000-0000-000000000000") {
    // Return mock if session is disabled/test
    const data = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return NextResponse.json({ projects: data });
  }

  try {
    const data = await db.select().from(projects).where(eq(projects.userId, user.id)).orderBy(desc(projects.createdAt));
    return NextResponse.json({ projects: data });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { name, description } = await req.json();
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000000";

  try {
    const [p] = await db.insert(projects).values({ userId, name, description }).returning();
    return NextResponse.json({ project: p });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
