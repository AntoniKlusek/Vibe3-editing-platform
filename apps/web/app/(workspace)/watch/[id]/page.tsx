import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, videos, eq } from "@vibe3/db";
import { HlsPlayer } from "@/components/HlsPlayer";
import { StatusBadge } from "@/components/StatusBadge";
import { Button, Card, Badge } from "@vibe3/ui";
import { Edit, Download, Link as LinkIcon, Info, BarChart3 } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await db
    .select({ title: videos.title })
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1)
    .then(res => res[0]);

  return { title: `${data?.title ?? "Watch"} | Vibe3` };
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  
  const video = await db
    .select()
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1)
    .then(res => res[0]);

  if (!video) notFound();

  return (
    <main className="pt-8 min-h-screen px-4 md:px-8 pb-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-12">
        {/* Video Player Section */}
        <section className="relative shadow-2xl shadow-black/50">
          {video.status === "READY" && video.manifestUrl ? (
            <HlsPlayer manifestUrl={video.manifestUrl} autoPlay={false} />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-surface-dim rounded-sm border border-on-surface-muted/5">
              <div className="flex flex-col items-center space-y-4">
                <StatusBadge status={video.status} />
                <p className="font-bold text-[0.65rem] uppercase tracking-widest text-on-surface-muted">
                  {video.status === "PROCESSING" ? "Transcoding Pipeline Active" : "Waiting for Ingestion"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Info & Actions Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Textual Content */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h1 className="font-headline text-5xl md:text-6xl tracking-[-0.02em] text-on-surface mb-6">
                {video.title}
              </h1>
              <div className="flex items-center gap-6">
                <Badge variant="default" className="px-4 py-1.5 bg-primary/20 text-primary border-primary/20">
                  Master Cut
                </Badge>
                <span className="font-bold text-[0.75rem] uppercase tracking-[0.1em] text-on-surface-muted opacity-60">
                   Uploaded {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {video.description && (
              <p className="text-on-surface-muted font-body leading-relaxed max-w-2xl text-lg">
                {video.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-surface-bright/40 px-5 py-3 rounded-sm flex items-center gap-3 border border-on-surface-muted/5">
                <span className="font-bold text-[0.65rem] uppercase opacity-40 tracking-widest text-on-surface-muted">Codec</span>
                <span className="font-bold text-[0.75rem] text-on-surface uppercase">H.264 / ABR</span>
              </div>
              <div className="bg-surface-bright/40 px-5 py-3 rounded-sm flex items-center gap-3 border border-on-surface-muted/5">
                <span className="font-bold text-[0.65rem] uppercase opacity-40 tracking-widest text-on-surface-muted">Resolution</span>
                <span className="font-bold text-[0.75rem] text-on-surface">{video.widthPx ?? "4K"}p</span>
              </div>
              <div className="bg-surface-bright/40 px-5 py-3 rounded-sm flex items-center gap-3 border border-on-surface-muted/5">
                <span className="font-bold text-[0.65rem] uppercase opacity-40 tracking-widest text-on-surface-muted">Container</span>
                <span className="font-bold text-[0.75rem] text-on-surface uppercase">HLS/m3u8</span>
              </div>
            </div>
          </div>

          {/* Creator Actions Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="p-8 space-y-6 bg-surface-dim border-on-surface-muted/5">
              <Button className="w-full py-6 flex items-center justify-center gap-3">
                <Edit className="w-5 h-5" />
                Edit Asset
              </Button>
              
              <div className="space-y-4 pt-4">
                <Button variant="ghost" className="w-full justify-between h-auto p-3 group">
                  <span className="font-bold text-[0.75rem] uppercase tracking-wider text-on-surface-muted group-hover:text-on-surface">Export Master</span>
                  <Download className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                </Button>
                <Button variant="ghost" className="w-full justify-between h-auto p-3 group">
                  <span className="font-bold text-[0.75rem] uppercase tracking-wider text-on-surface-muted group-hover:text-on-surface">Copy Pipeline Link</span>
                  <LinkIcon className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                </Button>
                <Button variant="ghost" className="w-full justify-between h-auto p-3 group">
                  <span className="font-bold text-[0.75rem] uppercase tracking-wider text-on-surface-muted group-hover:text-on-surface">System info</span>
                  <Info className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                </Button>
              </div>
            </Card>

            {/* Pipeline Health Card */}
            <div className="bg-surface-dim p-6 border border-on-surface-muted/5 rounded-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="font-bold text-[0.75rem] uppercase tracking-wider text-on-surface">Stream Health</span>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-2xl font-headline tracking-tight text-on-surface">98%</p>
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest opacity-40 text-on-surface-muted">Deliverability</p>
                </div>
                <div>
                  <p className="text-2xl font-headline tracking-tight text-on-surface">12ms</p>
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest opacity-40 text-on-surface-muted">Latency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
