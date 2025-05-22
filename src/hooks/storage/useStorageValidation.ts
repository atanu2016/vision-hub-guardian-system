
import { StorageSettings } from "@/types/camera";
import { validateStorageAccess } from "@/services/apiService";

export const useStorageValidation = () => {
  /**
   * Validates the storage configuration
   * @param settings Storage settings to validate
   * @returns Promise resolving to boolean indicating validation success
   */
  const validateStorage = async (settings: StorageSettings): Promise<boolean> => {
    try {
      // For local storage
      if (settings.type === 'local') {
        // Simple validation for local path
        if (!settings.path) {
          console.error('Local storage path is required');
          return false;
        }
        return await validateStorageAccess(settings);
      }
      
      // For NAS storage
      else if (settings.type === 'nas') {
        if (!settings.nasaddress || !settings.naspath) {
          console.error('NAS address and path are required');
          return false;
        }
        return await validateStorageAccess(settings);
      }
      
      // For S3 storage
      else if (settings.type === 's3') {
        if (!settings.s3endpoint || !settings.s3bucket || !settings.s3accesskey || !settings.s3secretkey) {
          console.error('S3 endpoint, bucket, access key, and secret key are required');
          return false;
        }
        return await validateStorageAccess(settings);
      }
      
      // For Google Drive
      else if (settings.type === 'google_drive') {
        if (!settings.googledrivertoken) {
          console.error('Google Drive token is required');
          return false;
        }
        return await validateStorageAccess(settings);
      }
      
      // For other provider types, implement their validation logic
      // For now, return true for testing purposes
      return true;
    } catch (error) {
      console.error('Storage validation error:', error);
      return false;
    }
  };

  return {
    validateStorage
  };
};
