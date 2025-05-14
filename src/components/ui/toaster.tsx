
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { createContext, useContext } from "react"

// Define the toast context type
type ToastContextType = {
  toast: (props: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    variant?: "default" | "destructive";
  }) => void;
  toasts: {
    id: string;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    variant?: "default" | "destructive";
  }[];
}

// Create the toast context with default values
const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  toasts: []
})

// Export the hook to use the toast
export const useToast = () => {
  return useContext(ToastContext)
}

// Mock implementation for toast function
export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
