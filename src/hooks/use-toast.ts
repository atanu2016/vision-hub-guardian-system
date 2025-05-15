
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
};

// Create a custom useToast hook that provides toast functionality
export function useToast() {
  return {
    toast: (title: string | ToastOptions, options?: ToastOptions) => {
      if (typeof title === 'string') {
        return sonnerToast(title, options);
      } else {
        // Title is actually an options object
        return sonnerToast(title.description || 'Notification');
      }
    },
    // Add utility methods for different toast types
    error: (title: string | ToastOptions, options?: ToastOptions) => {
      if (typeof title === 'string') {
        return sonnerToast.error(title, options);
      } else {
        return sonnerToast.error(title.description || 'Error');
      }
    },
    success: (title: string | ToastOptions, options?: ToastOptions) => {
      if (typeof title === 'string') {
        return sonnerToast.success(title, options);
      } else {
        return sonnerToast.success(title.description || 'Success');
      }
    },
    warning: (title: string | ToastOptions, options?: ToastOptions) => {
      if (typeof title === 'string') {
        return sonnerToast.warning(title, options);
      } else {
        return sonnerToast.warning(title.description || 'Warning');
      }
    },
    info: (title: string | ToastOptions, options?: ToastOptions) => {
      if (typeof title === 'string') {
        return sonnerToast.info(title, options);
      } else {
        return sonnerToast.info(title.description || 'Information');
      }
    },
    promise: sonnerToast.promise,
  };
}

// Create a standalone toast function with the same API as the hook
// This is for when you don't want to use the hook
export const toast = {
  // Default toast function
  toast: (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast(title, options);
    } else {
      return sonnerToast(title.description || 'Notification');
    }
  },
  // Utility methods
  error: (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast.error(title, options);
    } else {
      return sonnerToast.error(title.description || 'Error');
    }
  },
  success: (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast.success(title, options);
    } else {
      return sonnerToast.success(title.description || 'Success');
    }
  },
  warning: (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast.warning(title, options);
    } else {
      return sonnerToast.warning(title.description || 'Warning');
    }
  },
  info: (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast.info(title, options);
    } else {
      return sonnerToast.info(title.description || 'Information');
    }
  },
  promise: sonnerToast.promise
};
