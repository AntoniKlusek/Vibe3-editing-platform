import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] transition-all duration-200 border",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-surface-bright text-on-surface border-transparent",
        destructive: "bg-error-container/20 text-error border-error/20",
        outline: "border-on-surface-muted text-on-surface-muted",
        pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
        processing: "border-primary/40 bg-primary/20 text-primary animate-pulse",
        ready: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
        failed: "border-error/30 bg-error/10 text-error",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
