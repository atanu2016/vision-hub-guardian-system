
import { toast as sonnerToast, ToastT, ToastOptions } from "sonner";

// Create a custom useToast hook that provides toast functionality
export function useToast() {
  const toast = (title: string, options?: ToastOptions | undefined) => {
    return sonnerToast(title, options);
  };

  // Add helper methods to maintain the same API
  toast.error = (title: string, options?: ToastOptions) => {
    return sonnerToast.error(title, options);
  };

  toast.success = (title: string, options?: ToastOptions) => {
    return sonnerToast.success(title, options);
  };

  toast.warning = (title: string, options?: ToastOptions) => {
    return sonnerToast.warning(title, options);
  };

  toast.info = (title: string, options?: ToastOptions) => {
    return sonnerToast.info(title, options);
  };

  toast.promise = sonnerToast.promise;

  return { toast };
}

// Re-export the toast function from sonner directly
export const toast = sonnerToast;

// Export toast type
export type Toast = ToastT;
