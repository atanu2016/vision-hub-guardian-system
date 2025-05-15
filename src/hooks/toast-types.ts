
export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  action?: React.ReactNode;
  // Additional properties can be added here
}

export type ToastOptions = ToastProps | string;

// Define the shape of the toast function and its convenience methods
export interface ToastFunction {
  (options: ToastOptions): string;
  success: (title: string, options?: Omit<ToastProps, "title" | "variant">) => string;
  error: (title: string, options?: Omit<ToastProps, "title" | "variant">) => string;
  warning: (title: string, options?: Omit<ToastProps, "title" | "variant">) => string;
  info: (title: string, options?: Omit<ToastProps, "title" | "variant">) => string;
}
