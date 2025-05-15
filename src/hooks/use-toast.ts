
import { useToastContext } from "./toast-context";
import { ToastOptions, ToastFunction } from "./toast-types";
import { handleStringToast } from "./toast-utils";

export const useToast = () => {
  return useToastContext();
};

// Simple function for direct toast access
const getToastFunction = (): ToastFunction => {
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
    
    // Create a base toast function
    const toast = ((options: ToastOptions) => {
      if (typeof options === 'string') {
        options = handleStringToast(options);
      }
      
      return sonnerToast(options.title, { description: options.description });
    }) as ToastFunction;
    
    // Add helper methods
    toast.success = (title, options) => {
      return sonnerToast.success(title, { description: options?.description });
    };
    
    toast.error = (title, options) => {
      return sonnerToast.error(title, { description: options?.description });
    };
    
    toast.warning = (title, options) => {
      return sonnerToast.warning(title, { description: options?.description });
    };
    
    toast.info = (title, options) => {
      return sonnerToast(title, { description: options?.description });
    };
    
    return toast;
  }
};

// Re-export as simple functions for ease of use
export const toast = getToastFunction();

// Alias for toast
export const notify = toast;

// Re-export types
export type { ToastOptions, ToastOptions as Toast, ToastFunction };

// Add these for backward compatibility
export { ToastProvider } from "./toast-context";
