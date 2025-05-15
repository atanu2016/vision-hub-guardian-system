
import { useToastContext } from "./toast-context";
import { ToastOptions } from "./toast-types";

export const useToast = () => {
  return useToastContext();
};

// Simple function for direct toast access
const getToastFunction = () => {
  try {
    const toastContext = useToast();
    return toastContext.toast;
  } catch (e) {
    // This will happen outside of the React component tree
    // Return a simple alternative toast function that uses sonner directly
    console.warn(
      "Toast accessed outside React component tree; fallback to simpler implementation"
    );
    
    // Import sonner directly as a fallback
    const { toast: sonnerToast } = require("sonner");
    return (options: ToastOptions) => {
      return sonnerToast(options.title, { description: options.description });
    };
  }
};

// Re-export as simple functions for ease of use
export const toast = (options: ToastOptions) => {
  const contextToast = getToastFunction();
  return contextToast(options);
};

// Alias for toast
export const notify = toast;

// Re-export types
export type { ToastOptions, ToastOptions as Toast };
export type ToastFunction = (options: ToastOptions) => void;

// Add these for backward compatibility
export { ToastProvider } from "./toast-context";
