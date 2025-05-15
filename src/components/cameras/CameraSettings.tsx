
import { useState } from 'react';
import { Camera } from "@/types/camera";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CameraSettingsProps {
  camera: Camera;
  onSave: (updatedCamera: Camera) => void;
}

const CameraSettings = ({ camera, onSave }: CameraSettingsProps) => {
  const [cameraData, setCameraData] = useState<Camera>({ ...camera });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof Camera, value: string | boolean | number) => {
    setCameraData({
      ...cameraData,
      [field]: value
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      onSave(cameraData);
      toast({
        title: "Settings saved",
        description: "Camera settings have been updated successfully."
      });
    } catch (error) {
      console.error("Error saving camera settings:", error);
      toast({
        title: "Failed to save camera settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Camera Name</Label>
              <Input
                id="name"
                value={cameraData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={cameraData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={cameraData.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={cameraData.manufacturer || ''}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                value={cameraData.ipAddress}
                onChange={(e) => handleChange('ipAddress', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={cameraData.port || 80}
                onChange={(e) => handleChange('port', parseInt(e.target.value) || 80)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connectionType">Connection Type</Label>
              <Select
                value={cameraData.connectionType || 'ip'}
                onValueChange={(value) => handleChange('connectionType', value)}
              >
                <SelectTrigger id="connectionType">
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ip">IP Camera</SelectItem>
                  <SelectItem value="rtsp">RTSP</SelectItem>
                  <SelectItem value="rtmp">RTMP</SelectItem>
                  <SelectItem value="onvif">ONVIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(cameraData.connectionType === 'rtmp' || cameraData.connectionType === 'rtsp') && (
            <div className="space-y-2">
              <Label htmlFor="streamUrl">Stream URL</Label>
              <Input
                id="streamUrl"
                value={cameraData.rtmpUrl || ''}
                onChange={(e) => handleChange('rtmpUrl', e.target.value)}
                placeholder={`${cameraData.connectionType === 'rtmp' ? 'rtmp://' : 'rtsp://'}server/stream`}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={cameraData.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={cameraData.password || ''}
                placeholder="••••••••"
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setCameraData({ ...camera })}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default CameraSettings;
