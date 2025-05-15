
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { SettingsSectionProps } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const RecordingSettings = ({ cameraData, handleChange }: SettingsSectionProps) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">Recording Settings</CardTitle>
        <CardDescription>Configure recording options</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <Label htmlFor="recording" className="text-base font-medium">Enable Recording</Label>
                <p className="text-sm text-muted-foreground mt-1">Record video footage from this camera</p>
              </div>
              <Switch
                id="recording"
                checked={!!cameraData.recording}
                onCheckedChange={(checked) => handleChange('recording', checked)}
                className="data-[state=checked]:bg-vision-blue"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <Label htmlFor="motionDetection" className="text-base font-medium">Motion Detection</Label>
                <p className="text-sm text-muted-foreground mt-1">Record only when motion is detected</p>
              </div>
              <Switch
                id="motionDetection"
                checked={!!cameraData.motionDetection}
                onCheckedChange={(checked) => handleChange('motionDetection', checked)}
                className="data-[state=checked]:bg-vision-blue"
              />
            </div>
          </div>
          
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-muted text-xs font-medium p-2">Preview</div>
            <div className="p-1 bg-vision-dark-900">
              <AspectRatio ratio={16/9}>
                {cameraData.status === 'online' ? (
                  <div className="w-full h-full bg-vision-dark-800 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Camera Preview</p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-vision-dark-800 flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                  </div>
                )}
              </AspectRatio>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingSettings;
