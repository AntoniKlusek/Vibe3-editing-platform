"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@vibe3/ui";
import { cn } from "@/lib/utils";

const topNavItems = [
  { name: "Library", href: "/dashboard" },
];

export function VibeTopBar() {
  const pathname = usePathname();

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 bg-background sticky top-0 z-40 border-b border-on-surface-muted/5 backdrop-blur-md bg-background/80">
      <div className="flex items-center space-x-12">
        <Link href="/" className="text-2xl font-bold text-primary font-headline tracking-tighter">
          VIBE3
        </Link>
        <nav className="hidden md:flex space-x-8">
          {topNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-bold text-[0.75rem] uppercase tracking-[0.1em] transition-all duration-200 px-1 py-1 border-b-2",
                pathname === item.href 
                  ? "text-primary border-primary" 
                  : "text-on-surface-muted border-transparent hover:text-on-surface hover:border-on-surface-muted/20"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-6">
        <Link href="/upload">
          <Button size="default" className="font-bold">
            Upload
          </Button>
        </Link>
        
        <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center overflow-hidden border border-on-surface-muted/20 cursor-pointer hover:border-primary transition-colors">
          <div className="w-full h-full bg-gradient-to-tr from-primary/40 to-primary/10" />
        </div>
      </div>
    </header>
  );
}
