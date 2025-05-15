
import { ToastOptions } from "@/hooks/use-toast";

/**
 * Formats toast options to ensure consistent usage across the application
 * @param message Optional description message for the toast
 * @param options Additional toast options
 * @returns Properly formatted toast options
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
