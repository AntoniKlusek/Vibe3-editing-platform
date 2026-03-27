"use client";

import { VibeSidebar } from "@/components/VibeSidebar";
import { VibeTopBar } from "@/components/VibeTopBar";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-on-background">
      {/* Fixed Sidebar */}
      <VibeSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Navigation */}
        <VibeTopBar />

        {/* Page Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Minimalist Footer */}
        <footer className="px-8 py-4 bg-surface-dim border-t border-on-surface-muted/5 flex justify-between items-center">
          <div className="flex space-x-6">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-muted">
              Connection: Secure
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-muted">
              Sync: Optimal
            </span>
          </div>
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-muted/30">
            © 2026 VIBE3 EDITORIAL STUDIO
          </div>
        </footer>
      </div>
    </div>
  );
}
