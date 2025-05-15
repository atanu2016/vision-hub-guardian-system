
// Implement toast functionality
import { toast as sonnerToast } from "sonner";
import type { ToastT } from "sonner";

export const toast = sonnerToast;

// Re-export the useToast hook
export { useToast } from "sonner";

export type Toast = ToastT;
