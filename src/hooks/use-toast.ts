
// Implement toast functionality
import { toast as sonnerToast, type Toast as SonnerToast } from "sonner";

// Export the toast function
export const toast = sonnerToast;

// Re-export the toast type
export type Toast = SonnerToast;
