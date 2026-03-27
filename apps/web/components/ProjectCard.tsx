"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="aspect-[16/10] bg-surface-bright border border-on-surface-muted/10 p-8 flex flex-col justify-between hover:border-accent-cobalt transition-colors duration-300 relative overflow-hidden cursor-pointer"
      >
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent-cobalt animate-pulse" />
            <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-on-surface-muted">Active Project</span>
          </div>
          <h3 className="font-headline text-3xl text-on-surface group-hover:text-accent-cobalt transition-colors">
            {project.name}
          </h3>
          <p className="font-body text-sm text-on-surface-muted mt-4 line-clamp-2 max-w-[80%]">
            {project.description || "No cinematic log provided."}
          </p>
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="text-[0.65rem] font-bold uppercase tracking-wider text-on-surface-muted/50">
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <div className="w-8 h-8 rounded-full border border-on-surface-muted/20 flex items-center justify-center group-hover:bg-accent-cobalt group-hover:border-accent-cobalt transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-on-surface group-hover:text-white transition-colors">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Brutalist accents */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cobalt/5 translate-x-12 -translate-y-12 rotate-45 group-hover:bg-accent-cobalt/10 transition-colors" />
      </motion.div>
    </Link>
  );
}
