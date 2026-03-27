import { notFound } from "next/navigation";
import { db, videos, eq, and } from "@vibe3/db";
import { createServerClient } from "@/lib/supabase/server";
import { MicroEditor } from "@/components/MicroEditor";

interface EditorPageProps {
  params: Promise<{ id: string; videoId: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id: projectId, videoId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
             <h1 className="font-headline text-4xl text-on-surface uppercase">Access Denied</h1>
             <p className="text-on-surface-muted uppercase text-xs tracking-widest">Authentication required for editor access.</p>
          </div>
       </div>
    );
  }

  // Fetch video and ensure it belongs to the user and project
  const videoData = await db.query.videos.findFirst({
    where: and(
      eq(videos.id, videoId),
      eq(videos.projectId, projectId),
      eq(videos.userId, user.id)
    )
  });

  if (!videoData) return notFound();

  return (
    <main className="bg-background min-h-screen">
      <MicroEditor video={{
        id: videoData.id,
        title: videoData.title,
        manifestUrl: videoData.manifestUrl,
        thumbnailUrl: videoData.thumbnailUrl,
        durationSec: videoData.durationSec,
        projectId: videoData.projectId
      }} />
    </main>
  );
}
