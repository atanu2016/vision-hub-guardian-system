
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface DetectionSettings {
  sensitivityLevel: number;
  enabled: boolean;
  objectTypes: string[];
  smartDetection: boolean;
}

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
      // Simulate loading from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Detection settings loaded');
    } catch (error) {
      console.error('Error loading detection settings:', error);
      toast.error('Failed to load detection settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDetectionSettings = useCallback(async (settings: Partial<DetectionSettings>) => {
    setIsSaving(true);
    try {
      const updatedSettings = { ...detectionSettings, ...settings };
      setDetectionSettings(updatedSettings);
      
      // Simulate saving to API
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Detection settings updated');
    } catch (error) {
      console.error('Error saving detection settings:', error);
      toast.error('Failed to save detection settings');
    } finally {
      setIsSaving(false);
    }
  }, [detectionSettings]);

  return {
    detectionSettings,
    isLoading,
    isSaving,
    loadDetectionSettings,
    updateDetectionSettings
  };
};
