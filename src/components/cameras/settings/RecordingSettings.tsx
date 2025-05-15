
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SettingsSectionProps } from "./types";

const RecordingSettings = ({ cameraData, handleChange }: SettingsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recording Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="recording">Enable Recording</Label>
            <p className="text-sm text-muted-foreground">Record video footage from this camera</p>
          </div>
          <Switch
            id="recording"
            checked={!!cameraData.recording}
            onCheckedChange={(checked) => handleChange('recording', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="motionDetection">Motion Detection</Label>
            <p className="text-sm text-muted-foreground">Record only when motion is detected</p>
          </div>
          <Switch
            id="motionDetection"
            checked={!!cameraData.motionDetection}
            onCheckedChange={(checked) => handleChange('motionDetection', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingSettings;
