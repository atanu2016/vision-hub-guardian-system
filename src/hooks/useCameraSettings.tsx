
import { useState, useEffect } from 'react';
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";

export function useCameraSettings(camera: Camera, onSave: (updatedCamera: Camera) => void) {
  const [cameraData, setCameraData] = useState<Camera>({ ...camera });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const { toast } = useToast();

  // Check for changes when cameraData updates
  useEffect(() => {
    const hasChanged = JSON.stringify(cameraData) !== JSON.stringify(camera);
    setHasChanges(hasChanged);
  }, [cameraData, camera]);

  // Validate form when cameraData changes
  useEffect(() => {
    validateForm();
  }, [cameraData]);

  const validateForm = () => {
    // Required fields
    if (!cameraData.name?.trim()) {
      setIsValid(false);
      return;
    }

    // Each connection type has its own required fields
    switch (cameraData.connectionType) {
      case 'rtmp':
        if (!cameraData.rtmpUrl?.trim() || !cameraData.rtmpUrl.startsWith('rtmp://')) {
          setIsValid(false);
          return;
        }
        break;
      case 'hls':
        if (!cameraData.hlsUrl?.trim() || !cameraData.hlsUrl.includes('.m3u8')) {
          setIsValid(false);
          return;
        }
        break;
      case 'rtsp':
        if (!cameraData.rtmpUrl?.trim() || !cameraData.rtmpUrl.startsWith('rtsp://')) {
          setIsValid(false);
          return;
        }
        break;
      default:
        // IP, ONVIF, etc. require IP address validation
        if (!cameraData.ipAddress?.trim() || !isValidIP(cameraData.ipAddress)) {
          setIsValid(false);
          return;
        }
    }

    setIsValid(true);
  };

  const isValidIP = (ip: string) => {
    // Allow for local IPs to pass validation more easily
    if (ip === 'localhost') return true;
    
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (!ipPattern.test(ip)) return false;
    
    const parts = ip.split('.').map(part => parseInt(part, 10));
    return parts.every(part => part >= 0 && part <= 255);
  };

  const handleChange = (field: keyof Camera, value: string | boolean | number | string[]) => {
    setCameraData({
      ...cameraData,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!isValid) {
      toast({
        title: "Cannot save settings",
        description: "Please correct the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update camera status to ensure it's marked as processing the update
      const updatedCamera = {
        ...cameraData,
        lastSeen: new Date().toISOString() // Update last seen timestamp
      };
      
      onSave(updatedCamera);
      
      toast({
        title: "Settings saved",
        description: "Camera settings have been updated successfully. Please refresh the camera view to apply changes."
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving camera settings:", error);
      toast({
        title: "Failed to save camera settings",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCameraData({ ...camera });
    setHasChanges(false);
  };

  // Export all necessary properties
  return {
    cameraData,
    isLoading,
    hasChanges,
    isValid,
    handleChange,
    handleSave,
    handleReset
  };
}
