
import * as React from "react";
import { toast as sonnerToast } from "sonner";
import { ToastOptions, ToastFunction } from "./toast-types";
import { formatToastVariant } from "./toast-utils";

export interface ToastContextType {
  toast: ToastFunction;
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
    const id = options.id || Math.random().toString(36).slice(2);
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

  // Create success method
  const success = React.useCallback(
    (title: string, options?: Omit<ToastOptions, "title" | "variant">) => {
      return notify({ title, ...options, variant: "success" });
    },
    [notify]
  );

  // Create error method
  const error = React.useCallback(
    (title: string, options?: Omit<ToastOptions, "title" | "variant">) => {
      return notify({ title, ...options, variant: "destructive" });
    },
    [notify]
  );

  // Create warning method
  const warning = React.useCallback(
    (title: string, options?: Omit<ToastOptions, "title" | "variant">) => {
      return notify({ title, ...options, variant: "warning" });
    },
    [notify]
  );

  // Create info method
  const info = React.useCallback(
    (title: string, options?: Omit<ToastOptions, "title" | "variant">) => {
      return notify({ title, ...options });
    },
    [notify]
  );

  // Attach the helper methods to the notify function to create a ToastFunction
  const toastFunction = React.useMemo(() => {
    const toast = notify as ToastFunction;
    toast.success = success;
    toast.error = error;
    toast.warning = warning;
    toast.info = info;
    return toast;
  }, [notify, success, error, warning, info]);

  const value = React.useMemo(
    () => ({
      toast: toastFunction,
      dismiss,
      toasts,
    }),
    [toastFunction, dismiss, toasts]
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
