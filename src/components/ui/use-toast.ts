
// Re-export from the hooks implementation
import { useToast, toast, notify, type ToastOptions, type ToastFunction } from "@/hooks/use-toast";

// Re-export for backward compatibility
export { useToast, toast, notify };
export type { ToastOptions, ToastFunction };
export type Toast = ToastOptions;
