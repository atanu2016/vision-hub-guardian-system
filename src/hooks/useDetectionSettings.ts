
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
      await saveDetectionSettings(settings);
      setDetectionSettings(settings);
      toast.success("Detection settings updated");
    } catch (error) {
      console.error("Error saving detection settings:", error);
      toast.error("Failed to save detection settings");
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    detectionSettings,
    isLoading,
    isSaving,
    loadDetectionSettings,
    updateDetectionSettings
  };
};
