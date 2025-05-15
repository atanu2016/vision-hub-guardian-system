
// Implement toast functionality with proper hooks pattern
import { toast as sonnerToast } from "sonner";

// Re-export the toast function from sonner
export const toast = sonnerToast;

// Create a custom useToast hook
export function useToast() {
  return { toast };
}

// Export toast type
export type Toast = {
  id: string | number;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};
