
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
      name: "Generic RTSP (Port 5543)", 
      url: `rtsp://${cameraData.username || 'username'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:5543/stream` 
    },
    { 
      name: "Hikvision (Port 5543)", 
      url: `rtsp://${cameraData.username || 'admin'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:5543/Streaming/Channels/101` 
    },
    { 
      name: "Dahua (Port 5543)", 
      url: `rtsp://${cameraData.username || 'admin'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:5543/cam/realmonitor?channel=1&subtype=0` 
    },
    { 
      name: "Amcrest/IP Camera (Port 5543)", 
      url: `rtsp://${cameraData.username || 'admin'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:5543/cam/realmonitor?channel=1&subtype=1` 
    },
    { 
      name: "Reolink (Port 5543)", 
      url: `rtsp://${cameraData.username || 'admin'}:${cameraData.password || 'password'}@${cameraData.ipAddress || '192.168.1.x'}:5543/h264Preview_01_main` 
    },
  ];
  
  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const rtspUrl = typeof cameraData.rtspUrl === 'string' ? cameraData.rtspUrl.trim() : '';
      
      if (!rtspUrl) {
        setTestResult({
          success: false,
          message: "Please enter an RTSP URL before testing."
        });
        return;
      }
      
      // Validate RTSP URL format and port
      try {
        const url = new URL(rtspUrl);
        if (url.protocol !== 'rtsp:') {
          setTestResult({
            success: false,
            message: "Invalid RTSP URL. Must start with rtsp://"
          });
          return;
        }
        
        // Check if using port 5543 (required for this system)
        const port = url.port || '554';
        if (port !== '5543') {
          setTestResult({
            success: false,
            message: `Port ${port} detected. This system requires port 5543 for RTSP streams. Please update your URL.`
          });
          return;
        }
        
        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setTestResult({
          success: true,
          message: `RTSP URL format is valid and using port 5543. Save settings and test the stream connection.`
        });
      } catch (urlError) {
        setTestResult({
          success: false,
          message: "Invalid RTSP URL format. Please check the URL syntax."
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Connection test failed. Please verify the RTSP URL and network connectivity."
      });
    } finally {
      setTesting(false);
    }
  };
  
  const useExample = (exampleUrl: string) => {
    handleChange('rtspUrl', exampleUrl);
  };

  // Generate RTSP URL with port 5543 when camera details are available
  const generateRtspUrl = () => {
    if (cameraData.ipAddress && cameraData.username && cameraData.password) {
      const generatedUrl = `rtsp://${cameraData.username}:${cameraData.password}@${cameraData.ipAddress}:5543/stream`;
      handleChange('rtspUrl', generatedUrl);
    }
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
            <p>RTSP URL format (MUST use port 5543):</p>
            <ul className="pl-4 text-xs list-disc">
              <li>rtsp://192.168.1.100:5543/stream</li>
              <li>rtsp://admin:password@192.168.1.100:5543/stream</li>
              <li>rtsp://admin:password@192.168.1.100:5543/live/channel0</li>
              <li>rtsp://admin:password@192.168.1.100:5543/cam/realmonitor?channel=1&subtype=0</li>
            </ul>
            <p className="text-yellow-600 mt-1">⚠️ Port 5543 is required for this system</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <Input
        id="streamUrl"
        value={rtspUrlValue}
        onChange={(e) => {
          const value = e.target.value.trim();
          console.log("RTSP URL input changed:", value);
          handleChange('rtspUrl', value);
        }}
        placeholder="rtsp://username:password@ipaddress:5543/path"
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
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateRtspUrl}
          disabled={disabled || !cameraData.ipAddress || !cameraData.username || !cameraData.password}
        >
          Generate URL (Port 5543)
        </Button>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md mt-2">
        <div className="text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
          <Info className="h-3 w-3 mt-0.5 shrink-0" /> 
          <div>
            <p className="font-medium mb-1">⚠️ IMPORTANT: Port 5543 Required</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>This system requires RTSP streams to use port <strong>5543</strong></li>
              <li>Standard port 554 will not work with this application</li>
              <li>Configure your camera to stream on port 5543</li>
              <li>Format: <code className="text-xs bg-yellow-100 dark:bg-yellow-900 px-1 py-0.5 rounded">rtsp://username:password@ip:5543/path</code></li>
              <li>Ensure the camera is accessible on your network</li>
            </ul>
            <p className="mt-2 font-medium">After updating settings, click "Save" and use the "Retry Connection" button in the stream view.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium mb-2">Common Camera RTSP URLs (Port 5543)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {commonRTSPExamples.map((example, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm" 
              className="justify-start text-left overflow-hidden"
              onClick={() => useExample(example.url)}
              disabled={disabled}
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
