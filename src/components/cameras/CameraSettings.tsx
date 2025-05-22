
import { CameraSettingsProps } from "./settings/types";
import BasicSettings from "./settings/BasicSettings";
import ConnectionSettings from "./settings/ConnectionSettings";
import RecordingSettings from "./settings/RecordingSettings";
import SettingsActionButtons from "./settings/SettingsActionButtons";
import { useCameraSettings } from "@/hooks/useCameraSettings";
import { hasPermission } from "@/utils/permissionUtils";

const CameraSettings = ({ camera, onSave, userRole = 'user' }: CameraSettingsProps) => {
  const { 
    cameraData, 
    isLoading, 
    handleChange, 
    handleSave,
    handleReset,
    hasChanges,
    isValid
  } = useCameraSettings(camera, onSave);

  // Enable editing for all users
  const canEditSettings = true; // Allow all users to edit camera settings
  const isDisabled = false;     // Never disable the settings forms

  return (
    <div className="space-y-8 pb-16 relative">
      <BasicSettings 
        cameraData={cameraData} 
        handleChange={handleChange} 
        userRole={userRole}
        disabled={isDisabled}
      />
      
      <ConnectionSettings 
        cameraData={cameraData} 
        handleChange={handleChange} 
        userRole={userRole}
        disabled={isDisabled}
      />
      
      <RecordingSettings 
        cameraData={cameraData} 
        handleChange={handleChange} 
        userRole={userRole}
        disabled={isDisabled}
      />

      {/* Always show action buttons */}
      <SettingsActionButtons 
        onSave={handleSave}
        onReset={handleReset}
        isLoading={isLoading}
        hasChanges={hasChanges}
        isValid={isValid}
      />
    </div>
  );
};

export default CameraSettings;
