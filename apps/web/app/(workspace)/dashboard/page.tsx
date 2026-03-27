import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { db, projects, desc, eq } from "@vibe3/db";
import { ProjectCard } from "@/components/ProjectCard";
import { DashboardActions } from "@/components/DashboardActions";

export const metadata: Metadata = { title: "Projects | Vibe3" };

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000000";

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));

  return (
    <section className="p-12 flex-grow">
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-on-surface-muted/10 pb-8">
          <div>
            <h2 className="font-headline text-[3.5rem] leading-none tracking-[-0.02em] text-on-surface mb-4">
              Your Pipeline
            </h2>
            <p className="font-body text-on-surface-muted max-w-lg">
              Organize cinematic assets into project-based workflows for micro-editing.
            </p>
          </div>
          <div className="mt-8 md:mt-0">
            <DashboardActions />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {userProjects.map((project) => (
          <ProjectCard key={project.id} project={project as any} />
        ))}
      </div>

      {userProjects.length === 0 && (
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24 border border-dashed border-on-surface-muted/20 rounded-sm bg-surface-dim/40">
          <p className="text-on-surface-muted font-bold text-[0.75rem] uppercase tracking-widest mb-8">
            No active project pipelines.
          </p>
          <DashboardActions />
        </div>
      )}
    </section>
  );
}
