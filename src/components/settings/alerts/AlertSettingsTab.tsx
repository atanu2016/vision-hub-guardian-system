
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import AlertTypes from "./AlertTypes";
import NotificationSettings from "./NotificationSettings";
import CameraSpecificAlerts from "./CameraSpecificAlerts";
import { Camera } from "@/types/camera";

interface AlertSettings {
  motionDetection: boolean;
  cameraOffline: boolean;
  storageWarning: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  emailAddress: string;
  notificationSound: string;
}

interface AlertSettingsTabProps {
  alertSettings: AlertSettings;
  cameras: Camera[];
  saving: boolean;
  onSettingsChange: (settings: Partial<AlertSettings>) => void;
  onSaveSettings: () => void;
  onCameraAlertLevelChange: (cameraId: string, level: string) => void;
}

const AlertSettingsTab = ({
  alertSettings,
  cameras,
  saving,
  onSettingsChange,
  onSaveSettings,
  onCameraAlertLevelChange
}: AlertSettingsTabProps) => {
  return (
    <div className="space-y-6">
      <NotificationSettings
        emailNotifications={alertSettings.emailNotifications}
        pushNotifications={alertSettings.pushNotifications}
        emailAddress={alertSettings.emailAddress}
        notificationSound={alertSettings.notificationSound}
        onEmailNotifChange={(checked) => 
          onSettingsChange({ emailNotifications: checked })
        }
        onPushNotifChange={(checked) => 
          onSettingsChange({ pushNotifications: checked })
        }
        onEmailAddressChange={(email) => 
          onSettingsChange({ emailAddress: email })
        }
        onSoundChange={(sound) => 
          onSettingsChange({ notificationSound: sound })
        }
      />
      
      <AlertTypes
        motionDetection={alertSettings.motionDetection}
        cameraOffline={alertSettings.cameraOffline}
        storageWarning={alertSettings.storageWarning}
        onMotionChange={(checked) => 
          onSettingsChange({ motionDetection: checked })
        }
        onOfflineChange={(checked) => 
          onSettingsChange({ cameraOffline: checked })
        }
        onStorageChange={(checked) => 
          onSettingsChange({ storageWarning: checked })
        }
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={onSaveSettings}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
      
      <CameraSpecificAlerts 
        cameras={cameras} 
        onAlertLevelChange={onCameraAlertLevelChange} 
      />
    </div>
  );
};

export default AlertSettingsTab;
