import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Percentage improvement between a before and after metric (0–100, rounded). */
export function improvementPct(before: number, after: number) {
  if (before <= 0) return 0
  const pct = ((before - after) / before) * 100
  return Math.max(0, Math.round(pct))
}
