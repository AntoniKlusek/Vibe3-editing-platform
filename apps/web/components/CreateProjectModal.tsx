"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vibe3/ui";

export function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        onClose();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
      <div className="bg-surface border border-accent-cobalt p-12 max-w-xl w-full relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-on-surface-muted hover:text-on-surface cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        
        <h2 className="font-headline text-4xl text-on-surface mb-8">Initialize Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-muted mb-3">Project Title</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-bright border border-on-surface-muted/20 p-4 text-on-surface focus:border-accent-cobalt outline-none transition-colors"
              placeholder="e.g. Cinematic Sequence Alpha"
            />
          </div>
          
          <div>
            <label className="block text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-muted mb-3">Cinematic Log (Description)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-bright border border-on-surface-muted/20 p-4 text-on-surface focus:border-accent-cobalt outline-none transition-colors h-32 resize-none"
              placeholder="Operational notes for this sequence..."
            />
          </div>
          
          <Button 
            disabled={loading}
            className="w-full py-4 h-auto"
          >
            {loading ? "INITIALIZING..." : "CREATE PROJECT"}
          </Button>
        </form>
      </div>
    </div>
  );
}
