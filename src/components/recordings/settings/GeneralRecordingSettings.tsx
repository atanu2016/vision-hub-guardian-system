
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GeneralRecordingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Recording Settings</CardTitle>
        <CardDescription>Configure default recording options for all cameras</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label htmlFor="continuous" className="text-base font-medium">Continuous Recording</Label>
            <p className="text-sm text-muted-foreground mt-1">Record video continuously from cameras</p>
          </div>
          <Switch
            id="continuous"
            defaultChecked
            className="data-[state=checked]:bg-vision-blue"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label htmlFor="motionDetection" className="text-base font-medium">Motion Detection</Label>
            <p className="text-sm text-muted-foreground mt-1">Record when motion is detected</p>
          </div>
          <Switch
            id="motionDetection"
            defaultChecked
            className="data-[state=checked]:bg-vision-blue"
          />
        </div>
        
        <div className="p-4 rounded-lg border border-border">
          <Label htmlFor="quality" className="text-base font-medium">Default Recording Quality</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-3">Select default quality for recordings</p>
          <Select defaultValue="medium">
            <SelectTrigger>
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (360p)</SelectItem>
              <SelectItem value="medium">Medium (720p)</SelectItem>
              <SelectItem value="high">High (1080p)</SelectItem>
              <SelectItem value="ultra">Ultra HD (4K)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
