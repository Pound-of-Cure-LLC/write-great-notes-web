import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment variable check for middleware
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function humanizeSectionName(value: string): string {
  if (!value) {
    return ""
  }

  const words = value
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)

  return words
    .map((word) => {
      if (!word) {
        return ""
      }

      const lower = word.toLowerCase()

      // Preserve all-uppercase acronyms (e.g., "ROS", "HPI")
      if (word === word.toUpperCase()) {
        return word
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(" ")
}
