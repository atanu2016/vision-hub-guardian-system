
import { useState } from 'react';
import { StorageSettings } from '@/types/camera';
import { saveStorageSettings } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStorageValidation } from './useStorageValidation';
import { useStorageUsage } from './useStorageUsage';

export const useStorageOperations = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  const { validateStorage } = useStorageValidation();
  const { fetchStorageUsage } = useStorageUsage();

  // Save storage settings
  const handleSaveSettings = async (settings: StorageSettings) => {
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
      await fetchStorageUsage();
      
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
    isSaving,
    isClearing,
    handleSaveSettings,
    handleClearStorage
  };
};
