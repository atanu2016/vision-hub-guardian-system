
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  fetchDetectionSettings,
  saveDetectionSettings,
  DetectionSettings
} from '@/services/database/systemSettingsService';

export const useDetectionSettings = () => {
  // Detection settings
  const [detectionSettings, setDetectionSettings] = useState<DetectionSettings>({
    sensitivityLevel: 50,
    enabled: true,
    objectTypes: ["person", "vehicle"],
    smartDetection: false
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use refs to track last load time for caching
  const lastLoaded = useRef<number>(0);
  const cacheTimeout = 60000; // 1 minute cache
  
  // Fetch detection settings with cache optimization
  const loadDetectionSettings = useCallback(async (forceRefresh = false) => {
    // Only load if force refresh or cache expired
    const now = Date.now();
    if (!forceRefresh && (now - lastLoaded.current < cacheTimeout)) {
      console.log('[Detection Settings] Using cached data');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('[Detection Settings] Fetching fresh data');
      const data = await fetchDetectionSettings();
      setDetectionSettings(data);
      lastLoaded.current = now;
    } catch (error) {
      console.error("Error loading detection settings:", error);
      toast.error("Failed to load detection settings");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Debounced settings update function
  const updateDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update detection settings with debounce to reduce API calls
  const updateDetectionSettings = useCallback(async (settings: Partial<DetectionSettings>) => {
    // Cancel any pending debounced saves
    if (updateDebounceRef.current) {
      clearTimeout(updateDebounceRef.current);
    }
    
    // Update local state immediately for UI responsiveness
    setDetectionSettings(prev => ({
      ...prev,
      ...settings
    }));
    
    // Debounce the actual API call
    updateDebounceRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Apply the merged settings
        const updatedSettings: DetectionSettings = {
          ...detectionSettings,
          ...settings
        };
        
        await saveDetectionSettings(updatedSettings);
        toast.success("Detection settings updated");
      } catch (error) {
        console.error("Error saving detection settings:", error);
        toast.error("Failed to save detection settings");
      } finally {
        setIsSaving(false);
      }
    }, 500); // 500ms debounce
    
    return () => {
      if (updateDebounceRef.current) {
        clearTimeout(updateDebounceRef.current);
      }
    };
  }, [detectionSettings]); // Add detectionSettings as a dependency

  return {
    detectionSettings,
    isLoading,
    isSaving,
    loadDetectionSettings,
    updateDetectionSettings,
  };
};
