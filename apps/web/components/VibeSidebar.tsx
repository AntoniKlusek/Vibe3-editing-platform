"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Video, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "My Videos", href: "/dashboard", icon: Video },
  { name: "Upload Pipeline", href: "/upload", icon: Upload },
];

export function VibeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-dim flex flex-col p-6 space-y-8 z-50 border-r border-on-surface-muted/5">
      <div className="mb-4">
        <p className="text-on-surface-muted text-[0.75rem] font-bold uppercase tracking-[0.1em]">
          Workspace Solo Studio
        </p>
      </div>
      
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-sm transition-all duration-300 ease-in-out font-bold text-[0.75rem] uppercase tracking-[0.05em] cursor-pointer",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-on-surface-muted hover:bg-surface-bright hover:text-on-surface"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-on-surface-muted/5">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center border border-on-surface-muted/10 overflow-hidden">
             <div className="w-full h-full bg-primary/20" />
          </div>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface leading-none">Admin</p>
            <p className="text-[0.6rem] uppercase tracking-widest text-on-surface-muted">Creator Mode</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
