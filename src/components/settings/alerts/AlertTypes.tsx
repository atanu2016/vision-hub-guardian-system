
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AlertTypesProps {
  motionDetection: boolean;
  cameraOffline: boolean;
  storageWarning: boolean;
  onMotionChange: (checked: boolean) => void;
  onOfflineChange: (checked: boolean) => void;
  onStorageChange: (checked: boolean) => void;
}

const AlertTypes = ({
  motionDetection,
  cameraOffline,
  storageWarning,
  onMotionChange,
  onOfflineChange,
  onStorageChange
}: AlertTypesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Types</CardTitle>
        <CardDescription>
          Choose what events trigger alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="motionDetection">Motion Detection Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when motion is detected
            </p>
          </div>
          <Switch 
            id="motionDetection"
            checked={motionDetection}
            onCheckedChange={onMotionChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="cameraOffline">Camera Offline Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when a camera goes offline
            </p>
          </div>
          <Switch 
            id="cameraOffline"
            checked={cameraOffline}
            onCheckedChange={onOfflineChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="storageWarning">Storage Warning Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when storage is nearly full
            </p>
          </div>
          <Switch 
            id="storageWarning"
            checked={storageWarning}
            onCheckedChange={onStorageChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertTypes;
