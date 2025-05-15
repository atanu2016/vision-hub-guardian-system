
import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function toast(opts: ToastOptions) {
  const { title, description, variant, action, ...rest } = opts;

  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      ...rest,
    });
  }

  return sonnerToast(title, {
    description,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    ...rest,
  });
}

export const useToast = () => {
  return {
    toast,
  };
};

export type { ToastOptions };
