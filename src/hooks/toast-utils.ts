
import { toast as sonnerToast, type ToastOptions as SonnerToastOptions } from "sonner";
import { ToastOptions } from "./toast-types";

/**
 * Formats toast options based on variant and displays the appropriate Sonner toast
 */
export const formatToastVariant = (
  options: ToastOptions, 
  sonnerOptions: SonnerToastOptions & { id?: string }
) => {
  if (options.variant === "destructive") {
    sonnerToast.error(options.title, { 
      description: options.description,
      ...sonnerOptions 
    });
  } else if (options.variant === "success") {
    sonnerToast.success(options.title, { 
      description: options.description,
      ...sonnerOptions 
    });
  } else if (options.variant === "warning") {
    sonnerToast.warning(options.title, {
      description: options.description,
      ...sonnerOptions
    });
  } else {
    sonnerToast(options.title, { 
      description: options.description,
      ...sonnerOptions 
    });
  }
};

/**
 * Formats toast options to ensure consistent usage across the application
 */
export const formatToastOptions = (
  message?: string,
  options?: Omit<ToastOptions, "description">
): ToastOptions => {
  return {
    ...(message ? { description: message } : {}),
    ...options,
  };
};
