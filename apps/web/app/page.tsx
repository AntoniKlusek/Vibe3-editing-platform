import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Vibe3</h1>
      <p className="text-muted-foreground text-lg">Solo Creator Workspace</p>
      <div className="flex gap-4">
        <Link href="/upload" className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          Upload Video
        </Link>
        <Link href="/dashboard" className="rounded-lg border px-6 py-3 font-medium hover:bg-accent transition-colors">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
