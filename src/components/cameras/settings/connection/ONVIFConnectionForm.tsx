
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { SettingsConnectionProps } from "../types";

const ONVIFConnectionForm = ({ 
  cameraData, 
  handleChange, 
  disabled = false,
  errors = {}
}: SettingsConnectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="onvifPath" className="text-sm font-medium">ONVIF Path</Label>
      <Input
        id="onvifPath"
        value={cameraData.onvifPath || '/onvif/device_service'}
        onChange={(e) => handleChange('onvifPath', e.target.value)}
        placeholder="/onvif/device_service"
        disabled={disabled}
      />
      <Alert className="mt-2 bg-blue-50 dark:bg-blue-900/20">
        <AlertDescription className="text-sm flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p>
              <strong>Important:</strong> After changing settings, click "Save Changes" and refresh the camera view.
            </p>
            <p className="mt-1">
              If ONVIF connection fails, try using RTSP connection type with a direct URL.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ONVIFConnectionForm;
