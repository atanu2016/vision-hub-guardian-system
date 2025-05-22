
import { StorageSettings } from "@/types/camera";
import { toast } from "sonner";

export const useStorageValidation = () => {
  
  const validateStorage = async (settings: StorageSettings): Promise<boolean> => {
    // Basic validation logic
    if (!settings.type) {
      toast.error("Storage type is required");
      return false;
    }
    
    if (settings.retentiondays < 1) {
      toast.error("Retention period must be at least 1 day");
      return false;
    }
    
    // Type-specific validation
    if (settings.type === 'local') {
      if (!settings.path) {
        toast.error("Storage path is required for local storage");
        return false;
      }
    } else if (settings.type === 'nas') {
      if (!settings.nasaddress) {
        toast.error("NAS address is required");
        return false;
      }
      if (!settings.naspath) {
        toast.error("NAS path is required");
        return false;
      }
    } else if (settings.type === 's3') {
      if (!settings.s3endpoint || !settings.s3bucket || !settings.s3accesskey || !settings.s3secretkey) {
        toast.error("All S3 fields are required");
        return false;
      }
    }
    
    // All validations passed
    return true;
  };
  
  return { validateStorage };
};
