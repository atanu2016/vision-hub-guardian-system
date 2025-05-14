
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

export { toast } from "@/components/ui/toaster"
