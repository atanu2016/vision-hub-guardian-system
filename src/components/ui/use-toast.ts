
// Re-export from the hooks implementation
import { useToast, toast, notify, type ToastOptions } from "@/hooks/use-toast";

// Re-export for backward compatibility
export { useToast, toast, notify };
export type { ToastOptions };
export type Toast = ToastOptions;
export type ToastFunction = (options: ToastOptions) => void;
