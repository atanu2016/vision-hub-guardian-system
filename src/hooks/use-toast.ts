import * as React from "react"
import { 
  ToastActionElement, 
  ToastProps
} from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

export type ToasterToast = ToastProps & {
  id: string
  title?: string
  description?: React.ReactNode
  action?: ToastActionElement
}

export type ToastOptions = Partial<
  Pick<ToasterToast, "title" | "description" | "action" | "variant" | "duration">
> & {
  promise?: {
    error: string;
    loading: string;
    success: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  title?: string; // Added title property to fix type errors
};

// Define the type for toast function with methods
export interface ToastFunction {
  (opts: ToastOptions): string;
  error: (message: string, opts?: Omit<ToastOptions, "variant">) => string;
  success: (message: string, opts?: Omit<ToastOptions, "variant">) => string;
  warning: (message: string, opts?: Omit<ToastOptions, "variant">) => string;
  info: (message: string, opts?: Omit<ToastOptions, "variant">) => string;
}

export interface Toast {
  id: string;
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  duration?: number;
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: Toast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<Toast>
      id: string
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
      id?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
      id?: string
    }

interface State {
  toasts: Toast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      id: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { id, toastId = id } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.id === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast(opts: ToastOptions): string {
  const id = genId()

  const update = (props: ToastOptions) =>
    dispatch({
      type: "UPDATE_TOAST",
      id,
      toast: { ...props },
    })

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...opts,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return id
}

// Helper methods for different toast variants
toast.error = (message: string, opts?: Omit<ToastOptions, "variant">): string => {
  return toast({ ...opts, title: message, variant: "destructive" });
};

toast.success = (message: string, opts?: Omit<ToastOptions, "variant">): string => {
  return toast({ ...opts, title: message, variant: "default" });
};

toast.warning = (message: string, opts?: Omit<ToastOptions, "variant">): string => {
  return toast({ ...opts, title: message, variant: "default" });
};

toast.info = (message: string, opts?: Omit<ToastOptions, "variant">): string => {
  return toast({ ...opts, title: message, variant: "default" });
};

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (id?: string) => dispatch({ type: "DISMISS_TOAST", id }),
  }
}

export { toast }

// For backwards compatibility with existing code that might use notify
export const notify = toast;
