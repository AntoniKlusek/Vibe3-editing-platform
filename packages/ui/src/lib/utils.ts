import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";

/** Merge Tailwind classes safely (Shadcn convention) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
