
import * as React from "react";
import { toast as sonnerToast } from "sonner";
import { ToastOptions } from "./toast-types";
import { formatToastVariant } from "./toast-utils";

export interface ToastContextType {
  toast: (options: ToastOptions) => string;
  success: (title: string, options?: Omit<ToastOptions, "variant">) => string;
  error: (title: string, options?: Omit<ToastOptions, "variant">) => string;
  warning: (title: string, options?: Omit<ToastOptions, "variant">) => string;
  info: (title: string, options?: Omit<ToastOptions, "variant">) => string;
  dismiss: (toastId?: string) => void;
  toasts: ToastOptions[];
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [toasts, setToasts] = React.useState<ToastOptions[]>([]);

  const notify = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: ToastOptions = {
      id,
      ...options,
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Map our toast options to Sonner options
    const sonnerOptions = {
      duration: options.duration,
      id,
      // Map additional options as needed
    };

    // Show toast using Sonner based on variant
    formatToastVariant(options, sonnerOptions);

    return id;
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      setToasts((prevToasts) =>
        prevToasts.filter(toast => toast.id !== toastId)
      );
      sonnerToast.dismiss(toastId);
    } else {
      setToasts([]);
      sonnerToast.dismiss();
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
      return notify({ title, ...options, variant: "warning" });
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
      toasts,
    }),
    [notify, success, error, warning, info, dismiss, toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};
