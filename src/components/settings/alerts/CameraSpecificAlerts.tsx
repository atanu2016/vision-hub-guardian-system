
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BellOff } from "lucide-react";
import { Camera } from "@/types/camera";

interface CameraSpecificAlertsProps {
  cameras: Camera[];
  onAlertLevelChange: (cameraId: string, level: string) => void;
}

const CameraSpecificAlerts = ({ cameras, onAlertLevelChange }: CameraSpecificAlertsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Camera-Specific Alerts</CardTitle>
        <CardDescription>
          Configure alerts for individual cameras
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cameras.length > 0 ? (
          cameras.map(camera => (
            <div key={camera.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">{camera.name}</p>
                <p className="text-sm text-muted-foreground">{camera.location}</p>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="mr-2">
                  {camera.motiondetection ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </Button>
                <Select 
                  defaultValue="all"
                  onValueChange={(value) => onAlertLevelChange(camera.id, value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Alert level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="motion">Motion Only</SelectItem>
                    <SelectItem value="offline">Offline Only</SelectItem>
                    <SelectItem value="none">No Alerts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No cameras found</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraSpecificAlerts;
