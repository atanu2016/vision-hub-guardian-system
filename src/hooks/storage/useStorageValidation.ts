
import { StorageSettings as StorageSettingsType } from '@/types/camera';
import { validateStorageAccess } from '@/services/apiService';

export const useStorageValidation = () => {
  // Validate storage configuration before saving
  const validateStorage = async (settings: StorageSettingsType): Promise<boolean> => {
    try {
      // Validate storage access based on the type
      switch (settings.type) {
        case 'local':
          // For local storage, we just check if the path is valid
          return !!settings.path;
          
        case 'nas':
          // For NAS, we need to check if the NAS is accessible
          if (!settings.nasAddress || !settings.nasPath) {
            return false;
          }
          // In a real implementation, we would check if the NAS is accessible
          // For now, we'll validate that required fields are provided
          return await validateStorageAccess(settings);
          
        case 's3':
          // For S3, we need more validation
          if (!settings.s3Endpoint || !settings.s3Bucket || 
              !settings.s3AccessKey || !settings.s3SecretKey) {
            return false;
          }
          
          // Call the API to validate S3 access
          return await validateStorageAccess(settings);
          
        case 'dropbox':
          // Validate Dropbox configuration
          if (!settings.dropboxToken) {
            return false;
          }
          return await validateStorageAccess(settings);
          
        case 'google_drive':
          // Validate Google Drive configuration
          if (!settings.googleDriveToken) {
            return false;
          }
          return await validateStorageAccess(settings);
          
        case 'onedrive':
          // Validate OneDrive configuration
          if (!settings.oneDriveToken) {
            return false;
          }
          return await validateStorageAccess(settings);
          
        case 'azure_blob':
          // Validate Azure Blob Storage configuration
          if (!settings.azureConnectionString || !settings.azureContainer) {
            return false;
          }
          return await validateStorageAccess(settings);
          
        case 'backblaze':
          // Validate Backblaze B2 configuration
          if (!settings.backblazeKeyId || !settings.backblazeApplicationKey || !settings.backblazeBucket) {
            return false;
          }
          return await validateStorageAccess(settings);
          
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
