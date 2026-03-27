import type { Metadata } from "next";
import { VideoUploader } from "@/components/VideoUploader";
import { Button, Card } from "@vibe3/ui";
import { Database } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Pipeline | Vibe3" };

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;

  if (!projectId) {
    return (
      <section className="p-12 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="font-headline text-3xl text-on-surface mb-4 uppercase tracking-tighter">Pipeline Disconnected</h2>
        <p className="font-body text-on-surface-muted mb-12 text-center max-w-sm">Please select an active project pipeline to begin cinematic ingestion.</p>
        <Link href="/dashboard" className="px-12 py-4 bg-accent-cobalt text-white font-headline tracking-widest hover:bg-accent-interactive transition-colors">
          BACK TO DASHBOARD
        </Link>
      </section>
    );
  }

  return (
    <section className="p-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-6">
             <Link href={`/projects/${projectId}`} className="text-[0.65rem] font-bold text-accent-cobalt hover:text-accent-interactive uppercase tracking-[0.2em] transition-colors flex items-center">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mr-2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
               Back to Project
             </Link>
          </div>
          <h1 className="font-headline text-[4rem] leading-none tracking-tighter text-on-surface mb-4">
            Ingestion.
          </h1>
          <p className="font-bold text-[0.7rem] uppercase tracking-[0.15em] text-on-surface-muted opacity-60">
            Cinematic Stream Protocol // TARGET: {projectId.slice(0, 8)}...
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 space-y-8">
            <VideoUploader projectId={projectId} />
          </div>

          {/* Metadata Controls (Secondary Placeholder for later) */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
             <Card className="p-8">
               <h3 className="font-bold text-[0.75rem] uppercase tracking-[0.1em] text-on-surface-muted mb-8">Metadata & Identity</h3>
               <div className="space-y-6">
                 {/* Input Field: Title */}
                 <div className="space-y-2">
                   <label className="font-bold text-[0.65rem] uppercase tracking-widest opacity-60">Entry Title</label>
                   <input 
                    className="w-full bg-surface-dim border-none ring-1 ring-on-surface-muted/10 focus:ring-primary text-on-surface font-body text-sm p-3 transition-all outline-none rounded-sm" 
                    placeholder="Untitled Master" 
                    type="text"
                   />
                 </div>
                 {/* Input Field: Description */}
                 <div className="space-y-2">
                   <label className="font-bold text-[0.65rem] uppercase tracking-widest opacity-60">Description</label>
                   <textarea 
                    className="w-full bg-surface-dim border-none ring-1 ring-on-surface-muted/10 focus:ring-primary text-on-surface font-body text-sm p-3 transition-all outline-none resize-none rounded-sm" 
                    placeholder="Director's notes or scene description..." 
                    rows={4}
                   />
                 </div>
               </div>
               <div className="mt-12 pt-8 border-t border-on-surface-muted/5">
                 <Button className="w-full font-bold">
                   Finalize Ingestion
                 </Button>
               </div>
             </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-8">
             {/* System Health Visualizer */}
             <div className="bg-surface-bright/40 p-6 flex items-center space-x-4 border border-on-surface-muted/5 rounded-sm">
                <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center bg-primary/5 text-primary">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-[0.65rem] uppercase tracking-widest opacity-60 leading-none mb-1 text-on-surface-muted">Node Status</p>
                  <p className="font-body text-sm text-on-surface">Transcoder-Local-01 <span className="text-emerald-500 ml-2">●</span></p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
