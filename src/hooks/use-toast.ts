
import { toast as sonnerToast } from "sonner";

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
  const toast = (title: string, options?: ToastOptions) => {
    return sonnerToast(title, {
      duration: options?.duration,
      action: options?.action,
      description: options?.description,
    });
  };

  // Add helper methods to maintain the same API
  toast.error = (title: string, options?: ToastOptions) => {
    return sonnerToast.error(title, {
      duration: options?.duration,
      action: options?.action,
      description: options?.description,
    });
  };

  toast.success = (title: string, options?: ToastOptions) => {
    return sonnerToast.success(title, {
      duration: options?.duration,
      action: options?.action,
      description: options?.description,
    });
  };

  toast.warning = (title: string, options?: ToastOptions) => {
    return sonnerToast.warning(title, {
      duration: options?.duration,
      action: options?.action,
      description: options?.description,
    });
  };

  toast.info = (title: string, options?: ToastOptions) => {
    return sonnerToast.info(title, {
      duration: options?.duration,
      action: options?.action,
      description: options?.description,
    });
  };

  toast.promise = sonnerToast.promise;

  return { toast };
}

// Re-export the toast function directly for easier usage
export const toast = (title: string, options?: ToastOptions) => {
  return sonnerToast(title, {
    duration: options?.duration,
    action: options?.action,
    description: options?.description,
  });
};

// Add utility methods to toast
toast.error = (title: string, options?: ToastOptions) => {
  return sonnerToast.error(title, {
    duration: options?.duration,
    action: options?.action,
    description: options?.description,
  });
};

toast.success = (title: string, options?: ToastOptions) => {
  return sonnerToast.success(title, {
    duration: options?.duration,
    action: options?.action,
    description: options?.description,
  });
};

toast.warning = (title: string, options?: ToastOptions) => {
  return sonnerToast.warning(title, {
    duration: options?.duration,
    action: options?.action,
    description: options?.description,
  });
};

toast.info = (title: string, options?: ToastOptions) => {
  return sonnerToast.info(title, {
    duration: options?.duration,
    action: options?.action,
    description: options?.description,
  });
};

toast.promise = sonnerToast.promise;

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};
