"use client";

import Link from "next/link";
import { Play, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Video } from "@vibe3/db/schema";

interface VideoCardProps {
  video: Video;
}

import { motion } from "framer-motion";

export function VideoCard({ video }: VideoCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
    >
      <Link href={`/watch/${video.id}`}>
        <div className="relative aspect-video bg-surface-dim overflow-hidden rounded-sm mb-4 border border-on-surface-muted/5 group-hover:border-primary/20 transition-all duration-500">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-dim">
              <span className="text-on-surface-muted text-[0.6rem] uppercase tracking-widest font-bold">
                No Preview
              </span>
            </div>
          )}
          
          <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded-sm text-[0.6rem] font-bold tracking-widest text-white border border-white/10">
            {video.durationSec
              ? `${Math.floor(video.durationSec / 60)}:${String(
                  video.durationSec % 60
                ).padStart(2, "0")}`
              : "00:00"}
          </div>

          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-sm shadow-xl shadow-primary/40 transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>
        </div>
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-headline text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <p className="font-bold text-[0.65rem] uppercase tracking-[0.1em] text-on-surface-muted">
            {video.widthPx && video.heightPx
              ? `${video.widthPx}x${video.heightPx}`
              : "Unknown"}{" "}
            • {formatDistanceToNow(new Date(video.createdAt))} ago
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-on-surface-muted hover:text-primary transition-colors mt-1"
        >
          <MoreVertical className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
