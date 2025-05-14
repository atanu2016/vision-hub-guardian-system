
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import { useToast as useToastPrimitive } from "@/components/ui/toaster"

const useToast = useToastPrimitive;

export type { ToastProps, ToastActionElement }
export { useToast }

// Create a toast function that can only be used inside components
export function toast(props: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}) {
  // This is just a wrapper around the useToast hook that will be called in components
  return props;
}
