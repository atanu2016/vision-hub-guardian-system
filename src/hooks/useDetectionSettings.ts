
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  fetchDetectionSettings,
  saveDetectionSettings
} from '@/services/database/systemSettingsService';

export const useDetectionSettings = () => {
  // Detection settings
  const [detectionSettings, setDetectionSettings] = useState({
    sensitivityLevel: 50,
    enabled: true,
    objectTypes: ["person", "vehicle"],
    smartDetection: false
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch detection settings
  const loadDetectionSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDetectionSettings();
      setDetectionSettings(data);
    } catch (error) {
      console.error("Error loading detection settings:", error);
      toast.error("Failed to load detection settings");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update detection settings
  const updateDetectionSettings = useCallback(async (settings) => {
    setIsSaving(true);
    try {
      // Ensure all required properties are present when updating state
      const updatedSettings = {
        ...detectionSettings, // Keep existing values
        ...settings // Apply new values
      };
      
      await saveDetectionSettings(updatedSettings);
      setDetectionSettings(updatedSettings);
      toast.success("Detection settings updated");
    } catch (error) {
      console.error("Error saving detection settings:", error);
      toast.error("Failed to save detection settings");
    } finally {
      setIsSaving(false);
    }
  }, [detectionSettings]); // Add detectionSettings as a dependency

  return {
    detectionSettings,
    isLoading,
    isSaving,
    loadDetectionSettings,
    updateDetectionSettings
  };
};
