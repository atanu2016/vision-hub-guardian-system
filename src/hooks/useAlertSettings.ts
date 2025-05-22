
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AlertSettings {
  id?: string;
  motion_detection: boolean;
  camera_offline: boolean;
  storage_warning: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_sound: string;
  email_address?: string;
  updated_at?: string;
}

export const useAlertSettings = () => {
  const [settings, setSettings] = useState<AlertSettings>({
    motion_detection: true,
    camera_offline: true,
    storage_warning: true,
    email_notifications: false,
    push_notifications: false,
    notification_sound: 'default'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Load alert settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('alert_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          // Convert to AlertSettings type
          const loadedSettings: AlertSettings = {
            id: data.id,
            motion_detection: data.motion_detection,
            camera_offline: data.camera_offline,
            storage_warning: data.storage_warning,
            email_notifications: data.email_notifications,
            push_notifications: data.push_notifications,
            notification_sound: data.notification_sound || 'default',
            email_address: data.email_address || '',
            updated_at: data.updated_at
          };
          setSettings(loadedSettings);
        }
      } catch (error) {
        console.error('Error loading alert settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Save alert settings
  const saveSettings = async (newSettings: AlertSettings) => {
    setSaving(true);
    try {
      const { id, ...settingsData } = newSettings;
      
      let result;
      if (id) {
        // Update existing record
        result = await supabase
          .from('alert_settings')
          .update(settingsData)
          .eq('id', id);
      } else {
        // Insert new record
        result = await supabase
          .from('alert_settings')
          .insert([settingsData]);
      }
      
      if (result.error) throw result.error;
      
      toast.success('Alert settings saved successfully');
      
      // Refresh settings to get the updated data
      const { data } = await supabase
        .from('alert_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (data) {
        const updatedSettings: AlertSettings = {
          id: data.id,
          motion_detection: data.motion_detection,
          camera_offline: data.camera_offline,
          storage_warning: data.storage_warning,
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          notification_sound: data.notification_sound || 'default',
          email_address: data.email_address || '',
          updated_at: data.updated_at
        };
        setSettings(updatedSettings);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving alert settings:', error);
      toast.error('Failed to save alert settings');
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  return {
    settings,
    loading,
    saving,
    saveSettings
  };
};
