
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { createContext, useContext, useState } from "react"

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

// Create the actual provider component for the toast context
export function Toaster() {
  const [toasts, setToasts] = useState<ToastContextType["toasts"]>([])

  // Implement the toast function
  const toast = ({ title, description, action, variant = "default" }: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    variant?: "default" | "destructive";
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [
      { id, title, description, action, variant },
      ...prevToasts,
    ])
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
    }, 5000)
  }

  // Create the context value
  const contextValue = React.useMemo(() => ({ toast, toasts }), [toasts])

  return (
    <ToastContext.Provider value={contextValue}>
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
              <ToastClose onClick={() => 
                setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
              } />
            </Toast>
          )
        })}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}
