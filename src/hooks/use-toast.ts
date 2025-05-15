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

// Define the type for the notify function with methods
type NotifyFunction = {
  (title: string | ToastOptions, options?: ToastOptions): string | number;
  error: (title: string | ToastOptions, options?: ToastOptions) => string | number;
  success: (title: string | ToastOptions, options?: ToastOptions) => string | number;
  warning: (title: string | ToastOptions, options?: ToastOptions) => string | number;
  info: (title: string | ToastOptions, options?: ToastOptions) => string | number;
  promise: typeof sonnerToast.promise;
};

// Create the base function
const notifyFunction = (title: string | ToastOptions, options?: ToastOptions) => {
  if (typeof title === 'string') {
    return sonnerToast(title, options);
  } else {
    return sonnerToast(title.description || 'Notification');
  }
};

// Add methods to the function
export const notify: NotifyFunction = Object.assign(notifyFunction, {
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
});

// Keep the toast export for backward compatibility
export const toast = notify;
