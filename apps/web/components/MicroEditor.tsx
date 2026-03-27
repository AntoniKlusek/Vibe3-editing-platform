"use client";

import { useState } from "react";
import { HlsPlayer } from "./HlsPlayer";
import { Zap, Save, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MicroEditorProps {
  video: {
    id: string;
    title: string;
    manifestUrl: string | null;
    thumbnailUrl: string | null;
    durationSec: number | null;
    projectId: string | null;
  };
}

export function MicroEditor({ video }: MicroEditorProps) {
  const router = useRouter();
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(video.durationSec || 10);
  const [speed, setSpeed] = useState("1.0");
  const [isSaving, setIsSaving] = useState(false);
  const [clipTitle, setClipTitle] = useState(`${video.title} (Clip)`);

  const duration = video.durationSec || 1;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceVideoId: video.id,
          projectId: video.projectId,
          title: clipTitle,
          trimStart: Math.floor(startTime * 1000), // ms
          trimEnd: Math.floor(endTime * 1000),     // ms
          speed,
        }),
      });

      if (!res.ok) throw new Error("Failed to trigger clipping");

      router.push(`/projects/${video.projectId}`);
    } catch (err) {
      console.error(err);
      alert("Error saving clip. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-12 p-12 bg-background min-h-screen">
      {/* Left: Cinematic Preview */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <Link href={`/projects/${video.projectId}`} className="p-2 border border-on-surface-muted/20 hover:bg-surface-bright transition-colors rounded-full text-on-surface">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-headline text-3xl text-on-surface uppercase tracking-tight">{video.title}</h1>
              <p className="font-body text-[0.65rem] uppercase tracking-widest text-on-surface-muted mt-1 opacity-60">Source Intensity: High // Master Frame</p>
            </div>
          </div>
        </header>

        <div className="relative aspect-video bg-black border border-on-surface-muted/10 group overflow-hidden">
          {video.manifestUrl ? (
            <HlsPlayer manifestUrl={video.manifestUrl} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-accent-cobalt border-t-transparent rounded-full animate-spin" />
              <span className="font-bold text-[0.65rem] uppercase tracking-[0.2em] text-on-surface-muted">Decrypting HLS Stream...</span>
            </div>
          )}
        </div>

        {/* Timeline Editor (Brutalist Style) */}
        <div className="bg-surface-dim p-8 border border-on-surface-muted/10">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <span className="block font-bold text-[0.6rem] uppercase tracking-widest text-accent-cobalt">Time Range</span>
              <div className="font-headline text-3xl text-on-surface tracking-tighter">
                {startTime.toFixed(1)}S — {endTime.toFixed(1)}S
              </div>
            </div>
            <div className="text-right">
              <span className="block font-bold text-[0.6rem] uppercase tracking-widest text-on-surface-muted">Net Duration</span>
              <div className="font-headline text-2xl text-on-surface opacity-60">
                {((endTime - startTime) / parseFloat(speed)).toFixed(1)}S
              </div>
            </div>
          </div>

          <div className="relative h-12 bg-surface-bright/20 border border-on-surface-muted/5 group/timeline">
            {/* The Track */}
            <div className="absolute inset-0 bg-accent-cobalt/10" style={{ left: `${(startTime / duration) * 100}%`, right: `${100 - (endTime / duration) * 100}%` }} />

            {/* Start Handle */}
            <input
              type="range" min="0" max={duration} step="0.1" value={startTime}
              onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime - 0.5))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            />
            {/* End Handle (Visual layer only, second slider is too complex for basic HTML5 without custom logic) */}
            {/* We'll use two separate ranges for now for simplicity in MVP */}
          </div>

          <div className="grid grid-cols-2 gap-8 mt-6">
            <div className="space-y-3">
              <label className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-muted">Trim In</label>
              <input
                type="range" min="0" max={duration} step="0.1" value={startTime}
                onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime - 0.5))}
                className="w-full h-1 bg-surface-bright appearance-none rounded-full accent-accent-cobalt"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface-muted">Trim Out</label>
              <input
                type="range" min="0" max={duration} step="0.1" value={endTime}
                onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime + 0.5))}
                className="w-full h-1 bg-surface-bright appearance-none rounded-full accent-accent-cobalt"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Controls & Parameters */}
      <div className="col-span-12 lg:col-span-4 flex flex-col space-y-8">
        <section className="bg-surface-dim p-10 border border-on-surface-muted/10 flex-1">
          <h2 className="font-headline text-2xl text-on-surface uppercase tracking-tight mb-12">Metadata & Pulse</h2>

          <div className="space-y-12">
            <div className="space-y-4">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-muted">Clip Title</label>
              <input
                type="text" value={clipTitle} onChange={(e) => setClipTitle(e.target.value)}
                className="w-full bg-transparent border-b border-on-surface-muted/20 pb-4 font-headline text-xl text-on-surface focus:border-accent-interactive outline-none transition-colors"
                placeholder="UNSPECIFIED_SEQUENCE"
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-muted">Playback Flux (Speed)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={Math.round(parseFloat(speed) * 100)}
                    onChange={(e) => setSpeed((parseFloat(e.target.value) / 100).toFixed(2))}
                    className="w-16 bg-surface-bright border border-on-surface-muted/20 px-2 py-1 text-right font-headline text-lg text-on-surface focus:border-accent-cobalt outline-none"
                    min="10"
                    max="1000"
                  />
                  <span className="text-[0.65rem] font-bold text-on-surface-muted uppercase">%</span>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.05"
                  value={parseFloat(speed)}
                  onChange={(e) => setSpeed(parseFloat(e.target.value).toFixed(2))}
                  className="w-full h-1 bg-surface-bright appearance-none rounded-full accent-accent-cobalt cursor-pointer"
                />

                <div className="flex justify-between">
                  <button
                    onClick={() => setSpeed("0.50")}
                    className={cn(
                      "text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 border transition-all",
                      speed === "0.50" ? "bg-accent-cobalt border-accent-cobalt text-white shadow-lg active:scale-95" : "bg-transparent border-on-surface-muted/20 text-on-surface-muted hover:border-on-surface-muted/40"
                    )}
                  >SLO-MO (0.5x)</button>
                  <button
                    onClick={() => setSpeed("1.00")}
                    className={cn(
                      "text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 border transition-all",
                      speed === "1.00" ? "bg-accent-cobalt border-accent-cobalt text-white shadow-lg active:scale-95" : "bg-transparent border-on-surface-muted/20 text-on-surface-muted hover:border-on-surface-muted/40"
                    )}
                  >NORMAL (1x)</button>
                  <button
                    onClick={() => setSpeed("2.00")}
                    className={cn(
                      "text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 border transition-all",
                      speed === "2.00" ? "bg-accent-cobalt border-accent-cobalt text-white shadow-lg active:scale-95" : "bg-transparent border-on-surface-muted/20 text-on-surface-muted hover:border-on-surface-muted/40"
                    )}
                  >FAST (2x)</button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface-bright/20 border border-accent-cobalt/10">
              <div className="flex items-start space-x-4">
                <Zap className="w-5 h-5 text-accent-cobalt mt-1" />
                <div>
                  <span className="block font-bold text-[0.6rem] uppercase tracking-widest text-on-surface">Server-Side Flux</span>
                  <p className="text-[0.65rem] leading-relaxed text-on-surface-muted mt-2 uppercase tracking-wide">
                    Changes will be rendered in high-fidelity on the Vibe3 GPU cluster. No local overhead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "w-full py-8 font-headline text-xl uppercase tracking-[0.2em] flex items-center justify-center space-x-4 transition-all cursor-pointer",
            isSaving ? "bg-on-surface-muted/20 text-on-surface/40 cursor-wait" : "bg-accent-cobalt text-white hover:bg-accent-interactive shadow-[0_20px_40px_rgba(0,71,171,0.2)]"
          )}
        >
          {isSaving ? (
            <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" />
              <span>GENERATE CLIP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
