"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, Maximize, Settings as SettingsIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface HlsPlayerProps {
  manifestUrl: string;
  autoPlay?: boolean;
  className?: string;
}

export function HlsPlayer({ manifestUrl, autoPlay = false, className }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState("Auto");
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;

    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({ startLevel: -1 });
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) void video.play();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = manifestUrl;
    }

    const updateProgress = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("play", () => setPlaying(true));
    video.addEventListener("pause", () => setPlaying(false));

    return () => {
      hls?.destroy();
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, [manifestUrl, autoPlay]);

  const togglePlay = () => {
    if (videoRef.current?.paused) videoRef.current.play();
    else videoRef.current?.pause();
  };

  return (
    <section 
      className={cn("relative aspect-video bg-surface-dim overflow-hidden rounded-sm group", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />

      {/* HLS Active Badge */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-sm border border-primary/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="font-bold text-[0.65rem] uppercase tracking-widest text-primary">HLS Active</span>
      </div>

      {/* Quality Selector */}
      <div className="absolute top-6 right-6 z-20">
        <button className="bg-black/60 backdrop-blur-md text-on-surface p-2 hover:bg-surface-bright transition-colors flex items-center gap-2 rounded-sm border border-on-surface-muted/10">
          <span className="font-bold text-[0.65rem] uppercase tracking-widest opacity-80">{quality} ABR</span>
          <SettingsIcon className="w-3 h-3" />
        </button>
      </div>

      {/* Controls Overlay */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 z-20 p-8 video-gradient-overlay flex flex-col justify-end transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar */}
        <div className="relative w-full h-[2px] bg-surface-bright mb-6 cursor-pointer group/progress">
          <div className="absolute top-0 left-0 h-full bg-primary" style={{ width: `${progress}%` }} />
          <div 
             className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
             style={{ left: `${progress}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={togglePlay} className="text-on-surface hover:text-primary transition-colors">
              {playing ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
            </button>
            <div className="flex items-center gap-4 text-on-surface/80">
              <Volume2 className="w-5 h-5" />
              <div className="w-24 h-[1px] bg-surface-bright">
                <div className="w-2/3 h-full bg-on-surface" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Info className="w-5 h-5 text-on-surface/60 hover:text-on-surface cursor-pointer" />
            <Maximize className="w-5 h-5 text-on-surface/60 hover:text-on-surface cursor-pointer" />
          </div>
        </div>
      </div>
    </section>
  );
}
