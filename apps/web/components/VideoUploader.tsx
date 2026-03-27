"use client";

import { useCallback, useState } from "react";
import { Progress, Card } from "@vibe3/ui";
import { Upload, RefreshCw } from "lucide-react";
import { useUpload } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";

const ACCEPTED = ".mp4,.mov,.mkv,.avi,.webm";

export function VideoUploader({ projectId }: { projectId: string }) {
  const { upload, progress, status, videoId, error } = useUpload();
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) void upload(file, projectId);
    },
    [upload, projectId]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-8">
      {/* Drop zone */}
      <label
        htmlFor="file-input"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-6 rounded-sm border-2 border-dashed p-20 cursor-pointer transition-all duration-300",
          dragging ? "border-primary bg-primary/5" : "border-on-surface-muted/20 hover:border-primary/40 bg-surface-dim/40",
          status === "uploading" ? "pointer-events-none opacity-40" : ""
        )}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-surface-bright rounded-sm mx-auto flex items-center justify-center border border-on-surface-muted/10 group-hover:border-primary/20 transition-colors">
            <Upload className="w-6 h-6 text-on-surface-muted" />
          </div>
          <div>
            <h4 className="font-headline text-lg mb-1">
              {status === "idle" ? "Drop Master Video" : "Ingesting Asset…"}
            </h4>
            <p className="font-body text-[0.75rem] text-on-surface-muted max-w-xs mx-auto">
              ProRes or DNxHR preferred. Automagic HLS multi-bitrate packaging starts on drop.
            </p>
          </div>
          <p className="font-bold text-[0.6rem] uppercase tracking-widest text-on-surface-muted opacity-40">
            {ACCEPTED} · MAX 10 GB
          </p>
        </div>
        <input
          id="file-input"
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={status === "uploading"}
        />
      </label>

      {/* Progress Card */}
      {status === "uploading" && (
        <Card className="p-8 relative overflow-hidden group">
           <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="font-headline text-xl mb-1">Upload Pipeline</h3>
              <p className="font-bold text-[0.75rem] uppercase tracking-[0.05em] text-primary">Active Stream</p>
            </div>
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary animate-spin-slow">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between font-bold text-[0.65rem] uppercase tracking-widest mb-2 opacity-60">
                <span>Master Ingestion</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="bg-surface-dim" />
            </div>
            <div>
              <div className="flex justify-between font-bold text-[0.65rem] uppercase tracking-widest mb-2 opacity-30">
                <span>HLS Transcoding</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="bg-surface-dim opacity-30" />
            </div>
          </div>
        </Card>
      )}

      {/* Status messages */}
      {status === "done" && (
        <div className="rounded-sm bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 text-sm text-emerald-500 font-bold uppercase tracking-widest flex items-center justify-between">
          <span>✓ Master asset synced.</span>
          {videoId && <a href={`/watch/${videoId}`} className="underline">View Asset →</a>}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-sm bg-error/10 border border-error/20 px-6 py-4 text-sm text-error font-bold uppercase tracking-widest">
          ⚠︎ {error ?? "Pipeline execution error."}
        </div>
      )}
    </div>
  );
}
