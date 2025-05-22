
import { useState, useEffect } from 'react';
import { fetchRecordingSettingsFromDB, saveRecordingSettingsToDB } from '@/services/database/recordingService';
import { toast } from 'sonner';

export type RecordingScheduleType = 'always' | 'workdays' | 'weekends' | 'custom';

export type RecordingSettings = {
  continuous: boolean;
  motionDetection: boolean;
  schedule: RecordingScheduleType;
  timeStart: string;
  timeEnd: string;
  daysOfWeek: string[];
  quality: string;
}

export function useRecordingSettings() {
  const [activeTab, setActiveTab] = useState<string>('settings');
  const [settings, setSettings] = useState<RecordingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load recording settings
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRecordingSettingsFromDB();
      // Ensure schedule is of type RecordingScheduleType
      const typedData = {
        ...data,
        schedule: data.schedule as RecordingScheduleType
      };
      setSettings(typedData);
    } catch (error) {
      console.error("Error loading recording settings:", error);
      toast.error("Failed to load recording settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Save recording settings
  const saveSettings = async (updatedSettings: RecordingSettings) => {
    setIsSaving(true);
    try {
      await saveRecordingSettingsToDB(updatedSettings);
      setSettings(updatedSettings);
      toast.success("Recording settings saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving recording settings:", error);
      toast.error("Failed to save recording settings");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Load settings on first render
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    activeTab,
    setActiveTab,
    settings,
    setSettings,
    isLoading,
    isSaving,
    loadSettings,
    saveSettings
  };
}
