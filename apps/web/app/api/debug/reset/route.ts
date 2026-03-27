import { NextResponse } from "next/server";
import { db, videos, projects } from "@vibe3/db";

export async function GET() {
  try {
    // Delete videos first due to foreign key constraints
    await db.delete(videos);
    // Then delete projects
    await db.delete(projects);
    
    return NextResponse.json({ success: true, message: "Database wiped." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
