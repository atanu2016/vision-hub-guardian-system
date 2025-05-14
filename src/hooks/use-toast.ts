
// Re-export sonner toast as the default toast provider
import { toast as sonnerToast } from "sonner";

// Re-export the original toast API for backward compatibility
export const toast = sonnerToast;

// Re-export the useToast hook from the UI component for backward compatibility
export { useToast } from "@/components/ui/toaster";
