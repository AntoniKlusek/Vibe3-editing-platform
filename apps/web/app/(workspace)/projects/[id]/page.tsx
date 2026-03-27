import { createServerClient } from "@/lib/supabase/server";
import { db, projects, videos, eq, and, desc } from "@vibe3/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VideoCard } from "@/components/VideoCard";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000000";

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, userId)),
  });

  if (!project) notFound();

  const allVideos = await db
    .select()
    .from(videos)
    .where(eq(videos.projectId, id))
    .orderBy(desc(videos.createdAt));

  const sourceVideos = allVideos.filter((v) => v.videoType === "SOURCE");
  const clips = allVideos.filter((v) => v.videoType === "CLIP");

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Sidebar: Source Repository */}
      <aside className="w-full lg:w-96 bg-surface-dim border-r border-on-surface-muted/10 p-12 overflow-y-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-headline text-2xl text-on-surface uppercase tracking-tight">Source Repository</h2>
          <Link 
            href={`/upload?projectId=${id}`}
            className="w-10 h-10 bg-accent-cobalt rounded-full flex items-center justify-center text-white hover:bg-accent-interactive transition-colors"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
          </Link>
        </div>

        <div className="space-y-8">
          {sourceVideos.map((video) => (
            <div key={video.id} className="group cursor-pointer">
              <div className="aspect-video bg-surface-bright border border-on-surface-muted/10 mb-4 relative overflow-hidden">
                {video.status === "READY" ? (
                  <img src={video.thumbnailUrl || ""} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-bright/50">
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-muted animate-pulse">{video.status}…</span>
                  </div>
                )}
                 <Link 
                  href={`/projects/${id}/editor/${video.id}`}
                  className="absolute inset-0 bg-accent-cobalt/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <span className="font-headline text-sm text-white font-bold tracking-widest">OPEN EDITOR</span>
                </Link>
              </div>
              <h4 className="font-headline text-sm text-on-surface truncate">{video.title}</h4>
              <p className="font-body text-[0.65rem] text-on-surface-muted uppercase tracking-widest mt-1">
                {video.durationSec ? `${Math.floor(video.durationSec)}S` : "ANALYZING…"}
              </p>
            </div>
          ))}

          {sourceVideos.length === 0 && (
             <div className="py-12 border border-dashed border-on-surface-muted/20 text-center rounded-sm">
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-muted">Empty Repository</p>
             </div>
          )}
        </div>
      </aside>

      {/* Main Content: Cinematic Clips (The Output) */}
      <main className="flex-1 p-12 bg-background overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 pb-8 border-b border-on-surface-muted/10">
            <div className="flex items-center space-x-3 mb-4">
               <Link href="/dashboard" className="text-[0.65rem] font-bold text-accent-cobalt hover:underline uppercase tracking-widest">Pipeline</Link>
               <span className="text-on-surface-muted text-xs">/</span>
               <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-muted">Project Delta</span>
            </div>
            <h1 className="font-headline text-[4rem] leading-none text-on-surface tracking-tighter">
              {project.name}
            </h1>
            <p className="font-body text-on-surface-muted mt-4 max-w-xl">
              {project.description || "Experimental sequence for high-contrast cinematic research."}
            </p>
          </header>

          <section>
            <div className="flex justify-between items-center mb-12">
               <h3 className="font-headline text-2xl text-on-surface uppercase tracking-tight">Cinematic Clips</h3>
               <div className="h-[1px] flex-1 bg-on-surface-muted/10 mx-8 hidden md:block" />
               <span className="font-bold text-[0.7rem] uppercase tracking-widest text-on-surface-muted">{clips.length} OUTPUTS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
              {clips.map((clip) => (
                <VideoCard key={clip.id} video={clip as any} />
              ))}
            </div>

            {clips.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 border border-dashed border-on-surface-muted/20 rounded-sm bg-surface-dim/40 max-w-lg mx-auto">
                <p className="text-on-surface-muted font-bold text-[0.65rem] uppercase tracking-widest">No output clips generated yet.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
