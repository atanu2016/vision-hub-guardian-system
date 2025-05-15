
import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { ToastProvider } from "@/hooks/toast-context";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <ToastProvider>
      <>
        <RadixToastProvider>
          <ToastViewport />
        </RadixToastProvider>
        <SonnerToaster />
      </>
    </ToastProvider>
  );
}
