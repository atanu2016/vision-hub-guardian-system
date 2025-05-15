
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  const { toast } = useToast()
  
  return (
    <>
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
      <SonnerToaster />
    </>
  )
}
