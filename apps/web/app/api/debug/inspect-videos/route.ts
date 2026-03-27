import { NextResponse } from "next/server";
import { db, videos, desc, eq } from "@vibe3/db";

export async function GET() {
  try {
    const allVideos = await db.select().from(videos).orderBy(desc(videos.createdAt)).limit(10);
    return NextResponse.json(allVideos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
