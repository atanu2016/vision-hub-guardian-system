
import { useState } from 'react';
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";

export function useCameraSettings(camera: Camera, onSave: (updatedCamera: Camera) => void) {
  const [cameraData, setCameraData] = useState<Camera>({ ...camera });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof Camera, value: string | boolean | number) => {
    setCameraData({
      ...cameraData,
      [field]: value
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      onSave(cameraData);
      toast({
        title: "Settings saved",
        description: "Camera settings have been updated successfully."
      });
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
  };

  return {
    cameraData,
    isLoading,
    handleChange,
    handleSave,
    handleReset
  };
}
