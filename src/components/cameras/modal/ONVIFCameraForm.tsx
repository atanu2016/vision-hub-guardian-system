
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { testONVIFConnection, suggestRtspUrls, ONVIFConnectionParams } from "@/utils/onvifTester";

interface ONVIFCameraFormProps {
  ipAddress: string;
  port: string;
  username: string;
  password: string;
  onvifPath: string;
  onChange: (field: string, value: string) => void;
}

const ONVIFCameraForm = ({
  ipAddress,
  port,
  username,
  password,
  onvifPath,
  onChange,
}: ONVIFCameraFormProps) => {
  const [showAdvancedHelp, setShowAdvancedHelp] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [suggestedUrls, setSuggestedUrls] = useState<string[]>([]);
  
  const handleTestConnection = async () => {
    if (!ipAddress || !port || !username || !password) {
      setTestResult({
        success: false,
        message: "Please fill in all required fields before testing"
      });
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Build test params
      const testParams: ONVIFConnectionParams = {
        hostname: ipAddress,
        port: parseInt(port),
        username,
        password,
        servicePath: onvifPath || "/onvif/device_service"
      };
      
      // Test connection
      const result = await testONVIFConnection(testParams);
      setTestResult({
        success: result.success,
        message: result.message
      });
      
      // If failed, suggest RTSP URLs based on common patterns
      if (!result.success) {
        const urls = suggestRtspUrls(testParams.hostname, testParams.port, testParams.username, testParams.password);
        setSuggestedUrls(urls);
      } else if (result.streamUri) {
        // If successful and we got a stream URI, suggest using it
        setSuggestedUrls([result.streamUri]);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error testing connection: ${error.message || "Unknown error"}`
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <>
      <div className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-md border border-amber-200/20 flex items-start gap-2">
          <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>To connect to an ONVIF camera, you'll need:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The camera's IP address and port (typically 80, 8000, or 8080)</li>
              <li>ONVIF credentials (often different from web interface credentials)</li>
              <li>ONVIF service path (usually "/onvif/device_service")</li>
            </ul>
          </div>
        </div>
        
        <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
          <AlertDescription className="text-sm flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span>
              <strong>Connection troubleshooting:</strong> If your camera doesn't connect, try the camera's default RTSP URL 
              instead. Many ONVIF cameras also support direct RTSP streaming.
            </span>
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="onvifIp" className={cn("flex items-center justify-between")}>
            IP Address*
            <span className="text-xs font-normal text-muted-foreground">Example: 192.168.1.100</span>
          </Label>
          <Input
            id="onvifIp"
            value={ipAddress}
            onChange={(e) => onChange("ipAddress", e.target.value)}
            placeholder="192.168.1.100"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="onvifPort" className={cn("flex items-center justify-between")}>
            Port*
            <span className="text-xs font-normal text-muted-foreground">Common: 80, 8000, 8080</span>
          </Label>
          <Input
            id="onvifPort"
            value={port}
            onChange={(e) => onChange("port", e.target.value)}
            placeholder="80"
            type="number"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="onvifUsername">Username*</Label>
          <Input
            id="onvifUsername"
            value={username}
            onChange={(e) => onChange("username", e.target.value)}
            placeholder="admin"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="onvifPassword">Password*</Label>
          <Input
            id="onvifPassword"
            type="password"
            value={password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="•••••••••"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="onvifPath" className={cn("flex items-center justify-between")}>
          ONVIF Path
          <span className="text-xs font-normal text-muted-foreground">Usually /onvif/device_service</span>
        </Label>
        <Input
          id="onvifPath"
          value={onvifPath}
          onChange={(e) => onChange("onvifPath", e.target.value)}
          placeholder="/onvif/device_service"
        />
      </div>
      
      <div className="mt-4">
        <Button 
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleTestConnection}
          disabled={isTesting || !ipAddress || !port || !username || !password}
          className="w-full"
        >
          {isTesting ? "Testing Connection..." : "Test ONVIF Connection"}
        </Button>
        
        {testResult && (
          <div className={cn("mt-2 p-2 text-sm rounded", 
            testResult.success ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
            "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {testResult.message}
          </div>
        )}
        
        {suggestedUrls.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Try these RTSP URLs instead:</p>
            <div className="mt-2 space-y-1">
              {suggestedUrls.map((url, i) => (
                <div key={i} className="text-xs bg-amber-100 dark:bg-amber-900/50 p-2 rounded flex justify-between">
                  <code className="font-mono">{url}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 px-2 text-amber-700"
                    onClick={() => {
                      onChange("connectionType", "rtsp");
                      onChange("rtmpUrl", url);
                    }}
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs mt-2 text-amber-700 dark:text-amber-500">
              Note: Switching to RTSP may provide better compatibility.
            </p>
          </div>
        )}
      </div>

      <Button 
        type="button" 
        variant="ghost" 
        className="text-xs text-muted-foreground px-0 mt-4" 
        onClick={() => setShowAdvancedHelp(!showAdvancedHelp)}
      >
        {showAdvancedHelp ? "Hide" : "Show"} advanced troubleshooting tips
      </Button>

      {showAdvancedHelp && (
        <div className="text-sm p-3 bg-muted rounded-md border text-muted-foreground">
          <p className="font-medium mb-2">Common ONVIF troubleshooting tips:</p>
          <ul className="space-y-2">
            <li>
              <strong>Hikvision cameras:</strong> Try RTSP URL format: <code className="text-xs bg-muted-foreground/20 p-1 rounded">rtsp://user:pass@camera-ip:554/Streaming/Channels/101</code>
            </li>
            <li>
              <strong>Dahua cameras:</strong> Try RTSP URL format: <code className="text-xs bg-muted-foreground/20 p-1 rounded">rtsp://user:pass@camera-ip:554/cam/realmonitor?channel=1&subtype=0</code>
            </li>
            <li>
              <strong>Generic cameras:</strong> Common RTSP paths include <code className="text-xs bg-muted-foreground/20 p-1 rounded">rtsp://user:pass@camera-ip:554/stream1</code> or <code className="text-xs bg-muted-foreground/20 p-1 rounded">/h264</code> or <code className="text-xs bg-muted-foreground/20 p-1 rounded">/live</code>
            </li>
            <li>
              <strong>Firewall issues:</strong> Make sure ports 80, 554, and the ONVIF port are open on your network
            </li>
            <li>
              <strong>After saving settings:</strong> Always click the "Save Changes" button in the camera settings and then try reconnecting.
            </li>
          </ul>
        </div>
      )}

      <div className="text-sm text-muted-foreground mt-4">
        <p>* Required fields</p>
      </div>
    </>
  );
};

export default ONVIFCameraForm;
