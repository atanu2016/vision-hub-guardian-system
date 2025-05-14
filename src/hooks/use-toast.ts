
// Fixed export to remove import-cycle
import { useToast as useRadixToast, toast } from "@/components/ui/use-toast";

export const useToast = useRadixToast;
export { toast };
