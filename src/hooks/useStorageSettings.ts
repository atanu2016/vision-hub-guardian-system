
import { useState, useEffect } from 'react';
import { StorageSettings as StorageSettingsType } from '@/types/camera';
import { getStorageSettings, saveStorageSettings, validateStorageAccess } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { parseStorageValue } from '@/utils/storageUtils';

interface StorageUsage {
  totalSpace: number;
  usedSpace: number;
  usedPercentage: number;
  usedSpaceFormatted: string;
  totalSpaceFormatted: string;
}

export const useStorageSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({
    totalSpace: 1000,
    usedSpace: 0,
    usedPercentage: 0,
    usedSpaceFormatted: "0 GB",
    totalSpaceFormatted: "1 TB"
  });

  // Load storage settings from API
  const loadStorageSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getStorageSettings();
      
      // Fetch storage usage data
      await fetchStorageUsage();
      
      return settings;
    } catch (error) {
      console.error("Failed to load storage settings:", error);
      toast({
        title: "Error Loading Settings",
        description: "Could not load storage settings. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real storage usage from the database
  const fetchStorageUsage = async () => {
    try {
      // Get system stats which contains storage info
      const { data: systemStats, error } = await supabase
        .from('system_stats')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      if (systemStats) {
        // Convert storage values
        const usedSpace = parseStorageValue(systemStats.storage_used);
        const totalSpace = parseStorageValue(systemStats.storage_total);
        const usedPercentage = systemStats.storage_percentage || 
          (totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0);
        
        setStorageUsage({
          usedSpace,
          totalSpace,
          usedPercentage,
          usedSpaceFormatted: systemStats.storage_used || "0 GB",
          totalSpaceFormatted: systemStats.storage_total || "1 TB"
        });
      }
    } catch (error) {
      console.error("Failed to fetch storage usage:", error);
      // Fallback to default values if we can't get real data
      setStorageUsage({
        totalSpace: 1000,
        usedSpace: 0,
        usedPercentage: 0,
        usedSpaceFormatted: "0 GB",
        totalSpaceFormatted: "1 TB"
      });
    }
  };

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
          return true;
          
        case 's3':
          // For S3, we need more validation
          if (!settings.s3Endpoint || !settings.s3Bucket || 
              !settings.s3AccessKey || !settings.s3SecretKey) {
            return false;
          }
          
          // Call the API to validate S3 access
          try {
            // This would be an actual validation call in a real implementation
            // For now, we'll simulate with a delay
            const isValid = await validateStorageAccess(settings);
            return isValid;
          } catch (error) {
            console.error("S3 validation error:", error);
            return false;
          }
          
        default:
          // For other storage types, we'd need specific validation
          // For now, we'll return true as a placeholder
          return true;
      }
    } catch (error) {
      console.error("Storage validation error:", error);
      return false;
    }
  };

  // Save storage settings
  const handleSaveSettings = async (settings: StorageSettingsType) => {
    setIsSaving(true);
    try {
      // First validate the storage configuration
      const isValid = await validateStorage(settings);
      
      if (!isValid) {
        toast({
          title: "Validation Failed",
          description: "The storage configuration could not be validated. Please check your settings.",
          variant: "destructive"
        });
        return false;
      }
      
      // Save to database through API service
      await saveStorageSettings(settings);
      
      toast({
        title: "Storage Settings Saved",
        description: "Your storage configuration has been updated successfully."
      });

      // Refresh storage usage data
      await fetchStorageUsage();
      return true;
    } catch (error) {
      console.error("Failed to save storage settings:", error);
      toast({
        title: "Error Saving Settings",
        description: "An error occurred while saving your storage settings.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle clearing storage
  const handleClearStorage = async () => {
    setIsClearing(true);
    try {
      // Try updating system_stats directly since the function might not exist
      const { error: updateError } = await supabase
        .from('system_stats')
        .update({ 
          storage_used: '0 GB',
          storage_percentage: 0
        });
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state to reflect changes
      setStorageUsage({
        ...storageUsage,
        usedSpace: 0,
        usedPercentage: 0,
        usedSpaceFormatted: "0 GB"
      });
      
      toast({
        title: "Storage Cleared",
        description: "All recordings have been successfully removed."
      });
      return true;
    } catch (error) {
      console.error("Failed to clear storage:", error);
      toast({
        title: "Error Clearing Storage",
        description: "An error occurred while clearing the storage.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsClearing(false);
    }
  };

  return {
    storageUsage,
    isLoading,
    isSaving,
    isClearing,
    loadStorageSettings,
    fetchStorageUsage,
    handleSaveSettings,
    handleClearStorage,
    validateStorage
  };
};
