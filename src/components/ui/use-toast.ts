
// Re-export from the hooks implementation
import { useToast, toast, notify, type ToastOptions, type ToastFunction } from "@/hooks/use-toast";
import type { ToastProps } from "@/hooks/toast-types";

// Re-export for backward compatibility
export { useToast, toast, notify };
export type { ToastOptions, ToastFunction, ToastProps };
export type Toast = ToastProps;
