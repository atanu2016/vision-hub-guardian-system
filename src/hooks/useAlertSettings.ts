
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Camera } from '@/types/camera';
import { toast } from 'sonner';
import { fetchCamerasFromDB } from '@/services/database/camera/fetchCameras';

// Define the structure for alert settings
export interface AlertSettings {
  id?: string;
  motion_detection: boolean;
  camera_offline: boolean;
  storage_warning: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  email_address?: string;
  notification_sound: string;
  updated_at?: string;
}

// Define camera alert level structure
export interface CameraAlertLevel {
  camera_id: string;
  alert_level: 'off' | 'low' | 'medium' | 'high';
}

// Hook to manage alert settings
export const useAlertSettings = () => {
  const [settings, setSettings] = useState<AlertSettings>({
    motion_detection: true,
    camera_offline: true,
    storage_warning: true,
    email_notifications: false,
    push_notifications: true,
    notification_sound: 'default',
  });
  
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [cameraAlertLevels, setCameraAlertLevels] = useState<Record<string, 'off' | 'low' | 'medium' | 'high'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load alert settings from the database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        // Fetch alert settings from database
        const { data: alertSettingsData, error: alertSettingsError } = await supabase
          .from('alert_settings')
          .select('*')
          .single();

        if (alertSettingsError && alertSettingsError.code !== 'PGRST116') {
          throw alertSettingsError;
        }

        if (alertSettingsData) {
          setSettings(alertSettingsData);
        }

        // Load cameras
        const camerasData = await fetchCamerasFromDB();
        setCameras(camerasData);

        // TODO: In the future, load camera-specific alert levels
        // For now, set default levels for all cameras
        const defaultAlertLevels: Record<string, 'off' | 'low' | 'medium' | 'high'> = {};
        camerasData.forEach(camera => {
          defaultAlertLevels[camera.id] = 'medium';
        });
        setCameraAlertLevels(defaultAlertLevels);

      } catch (error) {
        console.error('Error loading alert settings:', error);
        toast.error('Failed to load alert settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle alert settings changes
  const updateAlertSettings = useCallback((updatedSettings: Partial<AlertSettings>) => {
    setSettings(prev => ({ ...prev, ...updatedSettings }));
  }, []);

  // Handle camera alert level changes
  const handleCameraAlertLevelChange = useCallback((cameraId: string, level: 'off' | 'low' | 'medium' | 'high') => {
    setCameraAlertLevels(prev => ({
      ...prev,
      [cameraId]: level
    }));
  }, []);

  // Save settings to database
  const handleSaveSettings = useCallback(async () => {
    try {
      setSaving(true);
      
      // Save general alert settings
      const { error } = await supabase
        .from('alert_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // TODO: Save camera-specific alert levels to database in the future
      // For now, just simulating a successful save

      toast.success('Alert settings saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving alert settings:', error);
      toast.error('Failed to save alert settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  return {
    settings,
    cameras,
    loading,
    saving,
    updateAlertSettings,
    handleSaveSettings,
    handleCameraAlertLevelChange
  };
};
