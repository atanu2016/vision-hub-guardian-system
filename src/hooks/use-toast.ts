
import { toast as sonnerToast, type ToasterToast } from "sonner";

// Re-export the ToasterToast type from sonner, but with our own name
export type Toast = ToasterToast;

// Define our toast options type based on sonner's API
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
  // Helper function to handle both string and object options
  const createToast = (title: string | ToastOptions, options?: ToastOptions) => {
    if (typeof title === 'string') {
      return sonnerToast(title, {
        duration: options?.duration,
        action: options?.action,
        description: options?.description,
      });
    } else {
      // Title is actually an options object
      return sonnerToast(title.description || 'Notification', {
        duration: title.duration,
        action: title.action,
        description: title.description,
      });
    }
  };

  return {
    toast: (title: string | ToastOptions, options?: ToastOptions) => {
      return createToast(title, options);
    },
    // Add utility methods for different toast types
    error: (title: string | ToastOptions, options?: ToastOptions) => {
      if (typeof title === 'string') {
        return sonnerToast.error(title, options);
      } else {
        return sonnerToast.error(title.description || 'Error', title);
      }
    },
    success: (title: string | ToastOptions, options?: ToastOptions) => {
      if (typeof title === 'string') {
        return sonnerToast.success(title, options);
      } else {
        return sonnerToast.success(title.description || 'Success', title);
      }
    },
    warning: (title: string | ToastOptions, options?: ToastOptions) => {
      if (typeof title === 'string') {
        return sonnerToast.warning(title, options);
      } else {
        return sonnerToast.warning(title.description || 'Warning', title);
      }
    },
    info: (title: string | ToastOptions, options?: ToastOptions) => {
      if (typeof title === 'string') {
        return sonnerToast.info(title, options);
      } else {
        return sonnerToast.info(title.description || 'Information', title);
      }
    },
    promise: sonnerToast.promise,
  };
}

// Create a standalone toast function with the same API as the hook
const createToast = (title: string | ToastOptions, options?: ToastOptions) => {
  if (typeof title === 'string') {
    return sonnerToast(title, {
      duration: options?.duration,
      action: options?.action,
      description: options?.description,
    });
  } else {
    // Title is actually an options object
    return sonnerToast(title.description || 'Notification', {
      duration: title.duration,
      action: title.action,
      description: title.description,
    });
  }
};

// Export the toast function directly for easier usage
export const toast = (title: string | ToastOptions, options?: ToastOptions) => {
  return createToast(title, options);
};

// Add utility methods to toast
toast.error = (title: string | ToastOptions, options?: ToastOptions) => {
  if (typeof title === 'string') {
    return sonnerToast.error(title, options);
  } else {
    return sonnerToast.error(title.description || 'Error', title);
  }
};

toast.success = (title: string | ToastOptions, options?: ToastOptions) => {
  if (typeof title === 'string') {
    return sonnerToast.success(title, options);
  } else {
    return sonnerToast.success(title.description || 'Success', title);
  }
};

toast.warning = (title: string | ToastOptions, options?: ToastOptions) => {
  if (typeof title === 'string') {
    return sonnerToast.warning(title, options);
  } else {
    return sonnerToast.warning(title.description || 'Warning', title);
  }
};

toast.info = (title: string | ToastOptions, options?: ToastOptions) => {
  if (typeof title === 'string') {
    return sonnerToast.info(title, options);
  } else {
    return sonnerToast.info(title.description || 'Information', title);
  }
};

toast.promise = sonnerToast.promise;
