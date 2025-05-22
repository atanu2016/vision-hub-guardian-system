
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

  // Check if user has permission to edit camera settings
  // Only superadmin should be able to configure camera settings
  const canEditSettings = userRole === 'superadmin';
  const isDisabled = !canEditSettings;

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

      {canEditSettings && (
        <SettingsActionButtons 
          onSave={handleSave}
          onReset={handleReset}
          isLoading={isLoading}
          hasChanges={hasChanges}
          isValid={isValid}
        />
      )}
    </div>
  );
};

export default CameraSettings;
