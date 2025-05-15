
import * as React from "react";
import { 
  toast as sonerToast, 
  type ToastT, 
  type ToastOptions as SonnerToastOptions 
} from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  action?: React.ReactNode;
  // Additional properties can be added here
}

export type ToastOptions = ToastProps;

export interface Toast extends ToastOptions {
  id: string;
  createdAt: Date;
  visible: boolean;
}

export type ToastFunction = (props: ToastOptions) => void;

interface ToastContextType {
  toast: ToastFunction;
  success: (title: string, options?: Omit<ToastOptions, "variant">) => void;
  error: (title: string, options?: Omit<ToastOptions, "variant">) => void;
  warning: (title: string, options?: Omit<ToastOptions, "variant">) => void;
  info: (title: string, options?: Omit<ToastOptions, "variant">) => void;
  dismiss: (toastId?: string) => void;
  toasts: Toast[];
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const notify = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = {
      id,
      createdAt: new Date(),
      visible: true,
      ...options,
    };
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Map our toast options to Sonner options
    const sonnerOptions: SonnerToastOptions = {
      duration: options.duration,
      // Map additional options as needed
    };

    if (options.variant === "destructive") {
      sonerToast.error(options.title, { 
        description: options.description,
        ...sonnerOptions 
      });
    } else if (options.variant === "success") {
      sonerToast.success(options.title, { 
        description: options.description,
        ...sonnerOptions 
      });
    } else {
      sonerToast(options.title, { 
        description: options.description,
        ...sonnerOptions 
      });
    }

    return id;
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      setToasts((prevToasts) =>
        prevToasts.map((toast) =>
          toast.id === toastId ? { ...toast, visible: false } : toast
        )
      );
    } else {
      setToasts((prevToasts) =>
        prevToasts.map((toast) => ({ ...toast, visible: false }))
      );
    }
  }, []);

  const success = React.useCallback(
    (title: string, options?: Omit<ToastOptions, "variant">) => {
      return notify({ title, ...options, variant: "success" });
    },
    [notify]
  );

  const error = React.useCallback(
    (title: string, options?: Omit<ToastOptions, "variant">) => {
      return notify({ title, ...options, variant: "destructive" });
    },
    [notify]
  );

  const warning = React.useCallback(
    (title: string, options?: Omit<ToastOptions, "variant">) => {
      return notify({ title, ...options });
    },
    [notify]
  );

  const info = React.useCallback(
    (title: string, options?: Omit<ToastOptions, "variant">) => {
      return notify({ title, ...options });
    },
    [notify]
  );

  const value = React.useMemo(
    () => ({
      toast: notify,
      success,
      error,
      warning,
      info,
      dismiss,
      toasts: toasts.filter((toast) => toast.visible),
    }),
    [notify, success, error, warning, info, dismiss, toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Re-export as a simple function to make it easier to use
export const toast = (options: ToastOptions) => {
  const { toast } = useToast();
  return toast(options);
};

// Re-export notify as an alias
export const notify = toast;
