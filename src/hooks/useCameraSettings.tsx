
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

    // IP validation - only required for certain connection types
    if (cameraData.connectionType !== 'rtmp' && cameraData.connectionType !== 'hls') {
      if (!cameraData.ipAddress?.trim() || !isValidIP(cameraData.ipAddress)) {
        setIsValid(false);
        return;
      }
    }

    // RTMP URL validation for RTMP type
    if (cameraData.connectionType === 'rtmp' && (!cameraData.rtmpUrl?.trim() || !cameraData.rtmpUrl.startsWith('rtmp://'))) {
      setIsValid(false);
      return;
    }

    // HLS URL validation for HLS type
    if (cameraData.connectionType === 'hls' && (!cameraData.hlsUrl?.trim() || !cameraData.hlsUrl.includes('.m3u8'))) {
      setIsValid(false);
      return;
    }

    // RTSP URL validation for RTSP type
    if (cameraData.connectionType === 'rtsp' && (!cameraData.rtmpUrl?.trim() || !cameraData.rtmpUrl.startsWith('rtsp://'))) {
      setIsValid(false);
      return;
    }

    setIsValid(true);
  };

  const isValidIP = (ip: string) => {
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
      onSave(cameraData);
      toast({
        title: "Settings saved",
        description: "Camera settings have been updated successfully."
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving camera settings:", error);
      toast({
        title: "Failed to save camera settings",
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
