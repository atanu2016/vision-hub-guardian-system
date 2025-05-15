
import { Camera } from "@/types/camera";
import { CameraSettingsProps } from "./settings/types";
import BasicSettings from "./settings/BasicSettings";
import ConnectionSettings from "./settings/ConnectionSettings";
import RecordingSettings from "./settings/RecordingSettings";
import SettingsActionButtons from "./settings/SettingsActionButtons";
import { useCameraSettings } from "@/hooks/useCameraSettings";

const CameraSettings = ({ camera, onSave }: CameraSettingsProps) => {
  const { 
    cameraData, 
    isLoading, 
    handleChange, 
    handleSave,
    handleReset
  } = useCameraSettings(camera, onSave);

  return (
    <div className="space-y-6">
      <BasicSettings cameraData={cameraData} handleChange={handleChange} />
      <ConnectionSettings cameraData={cameraData} handleChange={handleChange} />
      <RecordingSettings cameraData={cameraData} handleChange={handleChange} />

      <SettingsActionButtons 
        onSave={handleSave}
        onReset={handleReset}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CameraSettings;
