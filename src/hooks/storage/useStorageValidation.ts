
import { StorageSettings } from '@/types/camera';

export const useStorageValidation = () => {
  // Validate storage configuration before saving
  const validateStorage = async (settings: StorageSettings): Promise<boolean> => {
    try {
      // Validate storage access based on the type
      switch (settings.type) {
        case 'local':
          // For local storage, we just check if the path is valid
          return !!settings.path;
          
        case 'nas':
          // For NAS, we need to check if the NAS is accessible
          if (!settings.nasaddress || !settings.naspath) {
            return false;
          }
          // In a real implementation, we would check if the NAS is accessible
          // For now, we'll validate that required fields are provided
          return true;
          
        case 's3':
          // For S3, we need more validation
          if (!settings.s3endpoint || !settings.s3bucket || 
              !settings.s3accesskey || !settings.s3secretkey) {
            return false;
          }
          
          // Call the API to validate S3 access
          return true;
          
        case 'dropbox':
          // Validate Dropbox configuration
          if (!settings.dropboxtoken) {
            return false;
          }
          return true;
          
        case 'google_drive':
          // Validate Google Drive configuration
          if (!settings.googledrivertoken) {
            return false;
          }
          return true;
          
        case 'onedrive':
          // Validate OneDrive configuration
          if (!settings.onedrivetoken) {
            return false;
          }
          return true;
          
        case 'azure_blob':
          // Validate Azure Blob Storage configuration
          if (!settings.azureconnectionstring || !settings.azurecontainer) {
            return false;
          }
          return true;
          
        case 'backblaze':
          // Validate Backblaze B2 configuration
          if (!settings.backblazekeyid || !settings.backblazeapplicationkey || !settings.backblazebucket) {
            return false;
          }
          return true;
          
        default:
          // For unknown storage types, return false as not supported
          return false;
      }
    } catch (error) {
      console.error("Storage validation error:", error);
      return false;
    }
  };

  return { validateStorage };
};
