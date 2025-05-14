
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

import { useToast as useShadcnToast } from "@/components/ui/toaster";

export type ToastActionType = {
  altText?: string;
  action?: ToastActionElement;
  destructive?: boolean;
  duration?: number;
} & Omit<ToastProps, "children">;

export function useToast() {
  const { toast } = useShadcnToast();
  
  return {
    toast,
    dismiss: () => {}, // Will be implemented if needed
  }
}

// Create and export the toast function directly
// Support both single object param and separate title, description params
export const toast = (
  titleOrOptions: string | {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    variant?: "default" | "destructive";
  },
  description?: string
) => {
  const toastContext = useShadcnToast();
  
  if (!toastContext) return;
  
  if (typeof titleOrOptions === 'string') {
    // Called with separate title and description
    toastContext.toast({
      title: titleOrOptions,
      description: description
    });
  } else {
    // Called with options object
    toastContext.toast(titleOrOptions);
  }
};
