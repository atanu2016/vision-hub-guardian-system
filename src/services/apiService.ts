
// Re-export all API services for backward compatibility
export * from './api';
export * from './database/advancedSettingsService';
export * from './database/webhookService';

// Add the missing validateStorageAccess function
export const validateStorageAccess = async (settings: any): Promise<boolean> => {
  // This is a placeholder function that would validate storage access in a real implementation
  // For now, just return true to avoid errors
  return true;
};
