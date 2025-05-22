
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAlertSettings, saveAlertSettings, getCameras } from "@/services/apiService";
import { Camera } from "@/types/camera";

export interface AlertSettings {
  motionDetection: boolean;
  cameraOffline: boolean;
  storageWarning: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  emailAddress: string;
  notificationSound: string;
}

export const useAlertSettings = () => {
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    motionDetection: true,
    cameraOffline: true,
    storageWarning: true,
    emailNotifications: false,
    pushNotifications: false,
    emailAddress: "",
    notificationSound: "default"
  });
  
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Load cameras and alert settings
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load cameras
        const loadedCameras = await getCameras();
        setCameras(loadedCameras);
        
        // Load alert settings
        const settings = await getAlertSettings();
        setAlertSettings(settings);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load alert settings");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const updateAlertSettings = (settings: Partial<AlertSettings>) => {
    setAlertSettings(prev => ({ ...prev, ...settings }));
  };

  const handleSaveSettings = async () => {
    // Basic email validation
    if (alertSettings.emailNotifications && !validateEmail(alertSettings.emailAddress)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setSaving(true);
      
      // Save alert settings
      await saveAlertSettings(alertSettings);
      toast.success("Alert settings saved successfully");
      
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save alert settings");
    } finally {
      setSaving(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Mock function for camera alert level changes
  // In a real app, this would update in your database
  const handleCameraAlertLevelChange = (cameraId: string, level: string) => {
    // This is a placeholder function
    // In a real implementation, update the camera alert settings
    toast.success(`Camera alert level set to ${level}`);
  };

  return {
    alertSettings,
    cameras,
    loading,
    saving,
    updateAlertSettings,
    handleSaveSettings,
    handleCameraAlertLevelChange
  };
};
