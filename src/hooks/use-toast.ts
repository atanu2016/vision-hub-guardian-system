
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import {
  useToast as useToastPrimitive,
} from "@/components/ui/toaster"

export type { ToastProps, ToastActionElement }
export const toast = useToastPrimitive().toast
export const useToast = useToastPrimitive
