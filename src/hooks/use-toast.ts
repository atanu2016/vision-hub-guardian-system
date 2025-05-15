
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
    console.warn(
      "Toast accessed outside React component tree; fallback to simpler implementation"
    );
    
    // Create a standalone toast function that works outside of React components
    // without requiring a dynamic import (which would make this async)
    const toast: ToastFunction = ((options: ToastOptions) => {
      // We'll use a dummy implementation that just logs for now
      // The actual toast will be shown by the global toast registry when within a component
      if (typeof options === 'string') {
        options = handleStringToast(options);
      }
      
      console.log('[Toast]', options.title, options.description || '');
      return options.id || `toast-${Date.now()}`;
    }) as ToastFunction;
    
    // Add helper methods
    toast.success = (title, options = {}) => {
      console.log('[Toast Success]', title, options.description || '');
      return `toast-success-${Date.now()}`;
    };
    
    toast.error = (title, options = {}) => {
      console.log('[Toast Error]', title, options.description || '');
      return `toast-error-${Date.now()}`;
    };
    
    toast.warning = (title, options = {}) => {
      console.log('[Toast Warning]', title, options.description || '');
      return `toast-warning-${Date.now()}`;
    };
    
    toast.info = (title, options = {}) => {
      console.log('[Toast Info]', title, options.description || '');
      return `toast-info-${Date.now()}`;
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
