
import { toast as sonnerToast } from "sonner";
import { ToastOptions, ToastProps } from "./toast-types";

type SonnerToastOptions = {
  description?: string;
  duration?: number;
  id?: string;
  [key: string]: any;
};

/**
 * Formats toast options based on variant and displays the appropriate Sonner toast
 */
export const formatToastVariant = (
  options: ToastProps, 
  sonnerOptions: SonnerToastOptions
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
  options?: Omit<ToastProps, "description">
): ToastProps => {
  return {
    ...(message ? { description: message } : {}),
    ...options,
  };
};

/**
 * Handles string-only toast calls by converting them to the expected format
 */
export const handleStringToast = (message: string): ToastProps => {
  return {
    title: message
  };
};
