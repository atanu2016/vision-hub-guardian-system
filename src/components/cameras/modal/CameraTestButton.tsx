
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2, Wifi, Camera, Link } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { testCameraConnection, CameraTestResult } from "./utils/cameraTestingService";
import { CameraFormValues } from "./types/cameraModalTypes";

interface CameraTestButtonProps {
  formValues: CameraFormValues;
  disabled?: boolean;
  onSuggestedUrl?: (url: string) => void;
}

const CameraTestButton = ({ formValues, disabled = false, onSuggestedUrl }: CameraTestButtonProps) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<CameraTestResult | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      console.log("Starting camera connection test...");
      const result = await testCameraConnection(formValues);
      console.log("Test result:", result);
      setTestResult(result);
    } catch (error) {
      console.error("Test failed:", error);
      setTestResult({
        success: false,
        message: "Test failed unexpectedly",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setTesting(false);
    }
  };

  const getConnectionIcon = () => {
    switch (formValues.connectionType) {
      case 'rtsp':
      case 'rtmp':
      case 'hls':
        return <Link className="h-4 w-4" />;
      case 'onvif':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Camera className="h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    if (testing) return "Testing Connection...";
    
    switch (formValues.connectionType) {
      case 'rtsp':
        return "Test RTSP Stream";
      case 'rtmp':
        return "Test RTMP Stream";
      case 'hls':
        return "Test HLS Stream";
      case 'onvif':
        return "Test ONVIF Device";
      case 'ip':
        return "Test IP Camera";
      default:
        return "Test Connection";
    }
  };

  const isTestDisabled = () => {
    if (disabled || testing) return true;
    
    // Check if required fields are filled based on connection type
    switch (formValues.connectionType) {
      case 'rtsp':
        return !formValues.rtspUrl && (!formValues.ipAddress || !formValues.username);
      case 'rtmp':
        return !formValues.rtmpUrl;
      case 'hls':
        return !formValues.hlsUrl;
      case 'onvif':
        return !formValues.ipAddress || !formValues.username || !formValues.password;
      case 'ip':
        return !formValues.ipAddress || !formValues.port;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleTest}
        disabled={isTestDisabled()}
        className="w-full"
      >
        {testing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <>
            {getConnectionIcon()}
            <span className="ml-2">{getButtonText()}</span>
          </>
        )}
      </Button>

      {testResult && (
        <Alert className={testResult.success ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"}>
          <div className="flex items-start gap-2">
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertDescription className={testResult.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}>
                <div className="font-medium">{testResult.message}</div>
                {testResult.details && (
                  <div className="text-sm mt-1 opacity-80">{testResult.details}</div>
                )}
                {testResult.brandDetected && (
                  <div className="text-sm mt-1 font-medium">
                    Detected Brand: {testResult.brandDetected.charAt(0).toUpperCase() + testResult.brandDetected.slice(1)}
                  </div>
                )}
              </AlertDescription>
              
              {testResult.suggestedUrls && testResult.suggestedUrls.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">Suggested RTSP URLs:</div>
                  <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                    {testResult.suggestedUrls.slice(0, 4).map((url, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-left h-auto p-2 text-xs"
                        onClick={() => onSuggestedUrl?.(url)}
                      >
                        <span className="truncate">{url}</span>
                      </Button>
                    ))}
                  </div>
                  {testResult.suggestedUrls.length > 4 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      +{testResult.suggestedUrls.length - 4} more suggestions available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}
      
      {!testing && !testResult && (
        <div className="text-xs text-muted-foreground text-center">
          {formValues.connectionType === 'onvif' && "Tests ONVIF device connectivity and discovers stream URLs"}
          {formValues.connectionType === 'rtsp' && "Validates RTSP URL format and suggests alternatives if needed"}
          {formValues.connectionType === 'rtmp' && "Validates RTMP stream URL format"}
          {formValues.connectionType === 'hls' && "Validates HLS stream URL format (.m3u8)"}
          {formValues.connectionType === 'ip' && "Tests HTTP/HTTPS camera web interface accessibility"}
        </div>
      )}
    </div>
  );
};

export default CameraTestButton;
