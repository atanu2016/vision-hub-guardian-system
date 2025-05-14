
import { toast as sonnerToast } from "sonner";
import { useToast as useToastUI } from "@/components/ui/toaster";

export const useToast = useToastUI;

// Export sonner toast with the right type
// This ensures that toast({ description: "..." }) works
export const toast = sonnerToast;
