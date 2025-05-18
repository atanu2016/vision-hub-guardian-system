
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type DetectionSettings = {
  sensitivityLevel: number;
  enabled: boolean;
  objectTypes: string[];
  smartDetection: boolean;
};

export const useDetectionSettings = () => {
  const [detectionSettings, setDetectionSettings] = useState<DetectionSettings>({
    sensitivityLevel: 50,
    enabled: true,
    objectTypes: ["person", "vehicle"],
    smartDetection: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const loadDetectionSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real application, fetch settings from API
      // For now, using default settings defined in useState
      console.log("Detection settings loaded");
    } catch (error) {
      console.error("Error loading detection settings:", error);
      toast.error("Failed to load detection settings");
    } finally {
      setIsLoading(false);
    }
    return detectionSettings;
  }, [detectionSettings]);
  
  const updateDetectionSettings = useCallback((newSettings: Partial<DetectionSettings>) => {
    setIsSaving(true);
    try {
      // Update local state
      setDetectionSettings(current => ({
        ...current,
        ...newSettings
      }));
      
      toast.success("Detection settings updated");
    } catch (error) {
      console.error("Error updating detection settings:", error);
      toast.error("Failed to update detection settings");
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

export default useDetectionSettings;
