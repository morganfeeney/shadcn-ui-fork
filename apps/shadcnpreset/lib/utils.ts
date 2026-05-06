import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sentence-cases a kebab-case slug (e.g. theme token keys).
 * `sidebar-primary` → "Sidebar primary"
 */
export function toSentenceCase(slug: string): string {
  if (!slug) return slug
  const spaced = slug.split("-").filter(Boolean).join(" ").toLowerCase()
  if (!spaced) return slug
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
