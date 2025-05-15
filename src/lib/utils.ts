
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate viewport heights for responsive layouts
export function getViewportHeight(offset: number = 0): string {
  return `calc(100vh - ${offset}px)`
}

// Helper function to handle image loading errors
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>) {
  event.currentTarget.src = '/placeholder.svg'
}
