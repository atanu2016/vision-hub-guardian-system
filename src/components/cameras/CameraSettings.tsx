
import { useState } from 'react';
import { Camera } from "@/types/camera";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CameraSettingsProps } from "./settings/types";
import BasicSettings from "./settings/BasicSettings";
import ConnectionSettings from "./settings/ConnectionSettings";
import RecordingSettings from "./settings/RecordingSettings";

const CameraSettings = ({ camera, onSave }: CameraSettingsProps) => {
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

  return (
    <div className="space-y-6">
      <BasicSettings cameraData={cameraData} handleChange={handleChange} />
      <ConnectionSettings cameraData={cameraData} handleChange={handleChange} />
      <RecordingSettings cameraData={cameraData} handleChange={handleChange} />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setCameraData({ ...camera })}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default CameraSettings;
