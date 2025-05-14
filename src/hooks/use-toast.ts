
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

import { useToast as useShadcnToast } from "@/components/ui/toaster"

export type ToastActionType = {
  altText?: string
  action?: ToastActionElement
  destructive?: boolean
  duration?: number
} & Omit<ToastProps, "children">

export function useToast() {
  const { toast } = useShadcnToast()
  
  return {
    toast,
    dismiss: () => {}, // Will be implemented if needed
  }
}

// Create and export the toast function directly
export const toast = (props: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}) => {
  // Get the toast function from the context
  const toastContext = useShadcnToast();
  if (toastContext) {
    toastContext.toast(props);
  }
};
