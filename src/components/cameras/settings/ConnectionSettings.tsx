
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSectionProps } from "./types";
import { useState } from "react";

const ConnectionSettings = ({ cameraData, handleChange }: SettingsSectionProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const validateField = (field: string, value: string) => {
    if (field === 'ipAddress') {
      if (!value.trim() && !['rtmp', 'hls'].includes(cameraData.connectionType)) {
        setErrors({...errors, [field]: 'IP Address is required'});
        return false;
      }
      
      // Basic IP validation when IP is required
      if (value.trim() && !['rtmp', 'hls'].includes(cameraData.connectionType)) {
        const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        if (!ipPattern.test(value)) {
          setErrors({...errors, [field]: 'Invalid IP address format'});
          return false;
        }
      }
    }
    
    if (field === 'port') {
      if (value && !['rtmp', 'hls'].includes(cameraData.connectionType)) {
        const portNum = parseInt(value);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
          setErrors({...errors, [field]: 'Port must be between 1-65535'});
          return false;
        }
      }
    }
    
    if (field === 'rtmpUrl' && cameraData.connectionType === 'rtmp') {
      if (!value.trim()) {
        setErrors({...errors, [field]: 'Stream URL is required for RTMP'});
        return false;
      }
      
      if (!value.startsWith('rtmp://')) {
        setErrors({...errors, [field]: 'RTMP URL should start with rtmp://'});
        return false;
      }
    }
    
    if (field === 'hlsUrl' && cameraData.connectionType === 'hls') {
      if (!value.trim()) {
        setErrors({...errors, [field]: 'Stream URL is required for HLS'});
        return false;
      }
      
      if (!value.includes('.m3u8')) {
        setErrors({...errors, [field]: 'HLS URL should include .m3u8 format'});
        return false;
      }
    }
    
    // Clear error when valid
    const updatedErrors = {...errors};
    delete updatedErrors[field];
    setErrors(updatedErrors);
    return true;
  };

  const handleInputChange = (field: keyof typeof cameraData, value: string | number) => {
    validateField(field as string, String(value));
    handleChange(field, value);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">Connection Settings</CardTitle>
        <CardDescription>Configure how to connect to this camera</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="connectionType" className="text-sm font-medium">Connection Type</Label>
            <Select
              value={cameraData.connectionType || 'ip'}
              onValueChange={(value) => handleChange('connectionType', value)}
            >
              <SelectTrigger id="connectionType" className="w-full">
                <SelectValue placeholder="Select connection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ip">IP Camera</SelectItem>
                <SelectItem value="rtsp">RTSP</SelectItem>
                <SelectItem value="rtmp">RTMP</SelectItem>
                <SelectItem value="hls">HLS Stream</SelectItem>
                <SelectItem value="onvif">ONVIF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {cameraData.connectionType !== 'rtmp' && cameraData.connectionType !== 'hls' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ipAddress" className="text-sm font-medium">
                  IP Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ipAddress"
                  value={cameraData.ipAddress}
                  onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                  placeholder="192.168.1.100"
                  className={errors.ipAddress ? "border-destructive" : ""}
                />
                {errors.ipAddress && (
                  <p className="text-xs text-destructive mt-1">{errors.ipAddress}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="port" className="text-sm font-medium">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={cameraData.port || 80}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 80)}
                  placeholder="80"
                  className={errors.port ? "border-destructive" : ""}
                />
                {errors.port && (
                  <p className="text-xs text-destructive mt-1">{errors.port}</p>
                )}
              </div>
            </>
          )}
        </div>
        
        {(cameraData.connectionType === 'rtmp') && (
          <div className="space-y-2">
            <Label htmlFor="rtmpUrl" className="text-sm font-medium">
              RTMP Stream URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rtmpUrl"
              value={cameraData.rtmpUrl || ''}
              onChange={(e) => handleInputChange('rtmpUrl', e.target.value)}
              placeholder="rtmp://server/stream"
              className={errors.rtmpUrl ? "border-destructive" : ""}
            />
            {errors.rtmpUrl && (
              <p className="text-xs text-destructive mt-1">{errors.rtmpUrl}</p>
            )}
          </div>
        )}
        
        {(cameraData.connectionType === 'hls') && (
          <div className="space-y-2">
            <Label htmlFor="hlsUrl" className="text-sm font-medium">
              HLS Stream URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="hlsUrl"
              value={cameraData.hlsUrl || ''}
              onChange={(e) => handleInputChange('hlsUrl', e.target.value)}
              placeholder="https://server/stream.m3u8"
              className={errors.hlsUrl ? "border-destructive" : ""}
            />
            {errors.hlsUrl && (
              <p className="text-xs text-destructive mt-1">{errors.hlsUrl}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Example: https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
            </p>
          </div>
        )}
        
        {(cameraData.connectionType === 'rtsp') && (
          <div className="space-y-2">
            <Label htmlFor="streamUrl" className="text-sm font-medium">
              RTSP Stream URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="streamUrl"
              value={cameraData.rtmpUrl || ''}
              onChange={(e) => handleInputChange('rtmpUrl', e.target.value)}
              placeholder="rtsp://server/stream"
              className={errors.rtmpUrl ? "border-destructive" : ""}
            />
            {errors.rtmpUrl && (
              <p className="text-xs text-destructive mt-1">{errors.rtmpUrl}</p>
            )}
          </div>
        )}
        
        {cameraData.connectionType !== 'rtmp' && cameraData.connectionType !== 'hls' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                value={cameraData.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="admin"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={cameraData.password || ''}
                placeholder="••••••••"
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionSettings;
