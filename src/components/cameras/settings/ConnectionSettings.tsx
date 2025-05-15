
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSectionProps } from "./types";

const ConnectionSettings = ({ cameraData, handleChange }: SettingsSectionProps) => {
  return (
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
  );
};

export default ConnectionSettings;
