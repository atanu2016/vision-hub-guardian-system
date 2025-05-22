
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsSectionProps } from "./types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { suggestRtspUrls } from "@/utils/onvifTester";

const ConnectionSettings = ({ cameraData, handleChange, disabled = false }: SettingsSectionProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [previousConnectionType, setPreviousConnectionType] = useState(cameraData.connectionType);
  const [suggestedUrls, setSuggestedUrls] = useState<string[]>([]);
  
  // When connection type changes, offer helpful migration suggestions
  useEffect(() => {
    if (previousConnectionType !== cameraData.connectionType) {
      // If changing from ONVIF to RTSP, generate possible RTSP URLs
      if (previousConnectionType === 'onvif' && cameraData.connectionType === 'rtsp') {
        const urls = suggestRtspUrls(
          cameraData.ipAddress,
          cameraData.port,
          cameraData.username,
          cameraData.password,
          cameraData.manufacturer
        );
        setSuggestedUrls(urls);
      } else {
        setSuggestedUrls([]);
      }
      
      setPreviousConnectionType(cameraData.connectionType);
    }
  }, [cameraData.connectionType, previousConnectionType]);
  
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
    
    if (field === 'rtmpUrl' && cameraData.connectionType === 'rtsp') {
      if (!value.trim()) {
        setErrors({...errors, [field]: 'Stream URL is required for RTSP'});
        return false;
      }
      
      if (!value.startsWith('rtsp://')) {
        setErrors({...errors, [field]: 'RTSP URL should start with rtsp://'});
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

  const useSuggestedUrl = (url: string) => {
    handleInputChange('rtmpUrl', url);
    setSuggestedUrls([]);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">Connection Settings</CardTitle>
        <CardDescription>Configure how to connect to this camera</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {suggestedUrls.length > 0 && (
          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-sm">
              <p className="font-medium">Suggested RTSP URLs for your camera:</p>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {suggestedUrls.map((url, i) => (
                  <div key={i} className="flex justify-between items-center bg-amber-100/50 dark:bg-amber-900/50 p-2 rounded text-xs">
                    <code className="font-mono">{url}</code>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={() => useSuggestedUrl(url)}
                      disabled={disabled}
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="connectionType" className="text-sm font-medium">Connection Type</Label>
            <Select
              value={cameraData.connectionType || 'ip'}
              onValueChange={(value) => handleChange('connectionType', value)}
              disabled={disabled}
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
                  disabled={disabled}
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
                  disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
            />
            {errors.rtmpUrl && (
              <p className="text-xs text-destructive mt-1">{errors.rtmpUrl}</p>
            )}
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" /> 
              Add authentication directly in URL: rtsp://username:password@ip:554/path
            </div>
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
                disabled={disabled}
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
                disabled={disabled}
              />
            </div>
          </div>
        )}
        
        {cameraData.connectionType === 'onvif' && (
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
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionSettings;
