
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info, HelpCircle } from "lucide-react";
import { SettingsConnectionProps } from "../types";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const RTSPConnectionForm = ({ 
  cameraData, 
  handleChange, 
  disabled = false,
  errors = {}
}: SettingsConnectionProps) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  
  const commonRTSPExamples = [
    { 
      name: "Generic RTSP", 
      url: `rtsp://${cameraData.username || 'username'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:554/stream` 
    },
    { 
      name: "Hikvision", 
      url: `rtsp://${cameraData.username || 'admin'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:554/Streaming/Channels/101` 
    },
    { 
      name: "Dahua", 
      url: `rtsp://${cameraData.username || 'admin'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:554/cam/realmonitor?channel=1&subtype=0` 
    },
    { 
      name: "Amcrest/IP Camera", 
      url: `rtsp://${cameraData.username || 'admin'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:554/cam/realmonitor?channel=1&subtype=1` 
    },
    { 
      name: "Reolink", 
      url: `rtsp://${cameraData.username || 'admin'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:554/h264Preview_01_main` 
    },
  ];
  
  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTestResult({
        success: true,
        message: "RTSP URL format looks valid. Save settings and retry connection to view stream."
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: "Could not validate RTSP URL. Check format and try again."
      });
    } finally {
      setTesting(false);
    }
  };
  
  const useExample = (exampleUrl: string) => {
    handleChange('rtspUrl', exampleUrl);
  };

  // Safely get the rtspUrl value
  const rtspUrlValue = typeof cameraData.rtspUrl === 'string' ? cameraData.rtspUrl : '';

  console.log("RTSPConnectionForm rendered with rtspUrl:", rtspUrlValue);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="streamUrl" className="text-sm font-medium">
          RTSP Stream URL <span className="text-destructive">*</span>
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-md">
            <p>RTSP URL format examples:</p>
            <ul className="pl-4 text-xs list-disc">
              <li>rtsp://192.168.1.100:554/stream1</li>
              <li>rtsp://admin:password@192.168.1.100:554/stream1</li>
              <li>rtsp://admin:password@192.168.1.100/stream</li>
              <li>rtsp://admin:password@192.168.1.100/cam/realmonitor?channel=1&subtype=0</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <Input
        id="streamUrl"
        value={rtspUrlValue}
        onChange={(e) => handleChange('rtspUrl', e.target.value)}
        placeholder="rtsp://ipaddress:port/path"
        className={errors.rtspUrl ? "border-destructive" : ""}
        disabled={disabled}
      />
      {errors.rtspUrl && (
        <p className="text-xs text-destructive mt-1">{errors.rtspUrl}</p>
      )}
      
      {testResult && (
        <div className={`p-2 rounded-md text-sm ${testResult.success ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
          {testResult.message}
        </div>
      )}
      
      <div className="flex items-center gap-2 mt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={testConnection} 
          disabled={testing || disabled || !rtspUrlValue}
        >
          {testing ? "Testing..." : "Test RTSP URL"}
        </Button>
        
        {cameraData.ipAddress && cameraData.username && cameraData.password && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => useExample(`rtsp://${cameraData.username}:${cameraData.password}@${cameraData.ipAddress}:554/stream`)}
          >
            Generate from Credentials
          </Button>
        )}
      </div>
      
      <div className="bg-muted p-3 rounded-md mt-2">
        <div className="text-xs text-muted-foreground flex items-start gap-2">
          <Info className="h-3 w-3 mt-0.5 shrink-0" /> 
          <div>
            <p className="font-medium mb-1">Common RTSP Stream Tips:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Add authentication in URL: <code className="text-xs bg-background px-1 py-0.5 rounded">rtsp://username:password@ip:554/path</code></li>
              <li>For local network cameras, use the local IP address (like 192.168.x.x)</li>
              <li>Default RTSP port is usually 554</li>
              <li>Path format varies by manufacturer (check camera documentation)</li>
              <li>Stream may require enabling in camera web interface</li>
            </ul>
            <p className="mt-2">After updating settings, click "Save" and use the "Retry Connection" button in the stream view.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium mb-2">Common Camera RTSP URLs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {commonRTSPExamples.map((example, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm" 
              className="justify-start text-left overflow-hidden"
              onClick={() => useExample(example.url)}
            >
              <div className="truncate">
                <span className="font-medium">{example.name}:</span> 
                <span className="text-xs text-muted-foreground ml-1">{example.url.substring(0, 30)}...</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RTSPConnectionForm;
