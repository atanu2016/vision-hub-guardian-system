
import { toast as sonnerToast } from "sonner";

// Define the toast option types based on sonner's API
export type Toast = {
  id: string | number;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  duration?: number;
};

export type ToastOptions = {
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  title?: string; // Added title property to fix type errors
};

// Define the type for toast function with methods
export type ToastFunction = {
  (title: string | ToastOptions, options?: ToastOptions): string | number;
  error: (title: string | ToastOptions, options?: ToastOptions) => string | number;
  success: (title: string | ToastOptions, options?: ToastOptions) => string | number;
  warning: (title: string | ToastOptions, options?: ToastOptions) => string | number;
  info: (title: string | ToastOptions, options?: ToastOptions) => string | number;
  promise: typeof sonnerToast.promise;
};

// Create a custom useToast hook that provides toast functionality
export function useToast() {
  return {
    toast: createToastFunction(),
    notify: createToastFunction()
  };
}

// Function to create a toast function with all the required methods
function createToastFunction(): ToastFunction {
  const toastFn = ((title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast(title, options);
    } else {
      // Title is actually an options object
      return sonnerToast(title.description || 'Notification');
    }
  }) as ToastFunction;

  toastFn.error = (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast.error(title, options);
    } else {
      return sonnerToast.error(title.description || 'Error');
    }
  };

  toastFn.success = (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast.success(title, options);
    } else {
      return sonnerToast.success(title.description || 'Success');
    }
  };

  toastFn.warning = (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast.warning(title, options);
    } else {
      return sonnerToast.warning(title.description || 'Warning');
    }
  };

  toastFn.info = (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast.info(title, options);
    } else {
      return sonnerToast.info(title.description || 'Information');
    }
  };

  toastFn.promise = sonnerToast.promise;

  return toastFn;
}

// Create standalone toast and notify functions
export const notify: ToastFunction = createToastFunction();
export const toast: ToastFunction = notify;
