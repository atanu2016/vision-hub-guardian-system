
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "@/types/camera";
import { AlertCircle, RefreshCw, ExternalLink, Settings, ArrowRight } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

interface ErrorDisplayProps {
  error: string | null;
  camera: Camera;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, camera, onRetry }) => {
  if (!error) return null;
  
  // Determine common error types
  const isRTSPError = camera.connectionType === 'rtsp' || 
    error.toLowerCase().includes('rtsp') ||
    (camera.connectionType === 'onvif' && camera.rtspUrl?.startsWith('rtsp://'));
    
  const isLocalNetworkIssue = 
    camera.ipAddress?.startsWith('192.168.') || 
    camera.ipAddress?.startsWith('10.') || 
    camera.ipAddress?.startsWith('172.') ||
    camera.status === 'online' && error.toLowerCase().includes('unavailable');
  
  const isONVIFError = camera.connectionType === 'onvif' && (
    error.includes('unavailable') || 
    error.includes('failed') || 
    error.includes('Connection') ||
    error.includes('ONVIF')
  );

  const isStreamFormatError = error.toLowerCase().includes('format') || 
    error.toLowerCase().includes('unsupported');
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-vision-dark-900/80">
      <div className="text-center max-w-md w-full px-6 py-5 bg-black/50 rounded-lg backdrop-blur-sm">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-lg font-medium mb-2">{error}</p>
        
        <p className="text-sm text-muted-foreground mb-4">
          {camera.status === 'offline' ? 
            "The camera is offline. Please check the camera's power and network connection." : 
            "The camera is online but the stream is unavailable. This is typically due to connection settings or local network issues."
          }
        </p>
        
        <Accordion type="single" collapsible className="text-left mb-4">
          {isLocalNetworkIssue && (
            <AccordionItem value="local-network">
              <AccordionTrigger className="text-sm font-medium py-2">
                Local Network Troubleshooting
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground bg-black/30 p-3 rounded">
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Verify the camera is powered on and connected to the network</li>
                  <li>Ensure your browser and the camera are on the same local network</li>
                  <li>Check if you can ping the camera IP address: <code className="bg-background/50 px-1 rounded">{camera.ipAddress}</code></li>
                  <li>Try accessing the camera's web interface directly</li>
                  <li>Verify there's no firewall or network policy blocking the connection</li>
                  <li>Check if the camera requires a VPN or specific network configuration</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {isRTSPError && (
            <AccordionItem value="rtsp">
              <AccordionTrigger className="text-sm font-medium py-2">
                RTSP Stream Issues
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground bg-black/30 p-3 rounded">
                <p className="font-medium mb-1">Common RTSP issues:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Incorrect RTSP URL format (should be <code className="bg-background/50 px-1 rounded">rtsp://ip:port/path</code>)</li>
                  <li>Missing authentication in URL (use <code className="bg-background/50 px-1 rounded">rtsp://username:password@ip:port/path</code>)</li>
                  <li>Wrong RTSP port (default is 554)</li>
                  <li>Incorrect stream path (varies by camera manufacturer)</li>
                  <li>Stream requires enabling in camera settings</li>
                  <li>Firewall or router blocking RTSP traffic</li>
                </ul>
                <p className="mt-2 text-xs">Try VLC player to test if your RTSP URL works correctly before using it here.</p>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {isONVIFError && (
            <AccordionItem value="onvif">
              <AccordionTrigger className="text-sm font-medium py-2">
                ONVIF Connection Issues
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground bg-black/30 p-3 rounded">
                <p className="font-medium mb-1">Common ONVIF issues:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Incorrect username or password</li>
                  <li>ONVIF not enabled on camera</li>
                  <li>Wrong ONVIF port (try port 80, 8000, or 8080)</li>
                  <li>Firewall blocking connection</li>
                  <li>Camera doesn't fully support ONVIF standard</li>
                  <li>Consider using RTSP URL directly instead</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {isStreamFormatError && (
            <AccordionItem value="format">
              <AccordionTrigger className="text-sm font-medium py-2">
                Stream Format Issues
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground bg-black/30 p-3 rounded">
                <p className="font-medium mb-1">Unsupported format issues:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Camera codec may not be supported by your browser</li>
                  <li>Stream may require transcoding to be compatible</li>
                  <li>Try a different stream profile or resolution from your camera</li>
                  <li>Some cameras offer multiple stream formats - check documentation</li>
                  <li>Consider using a direct RTSP URL instead of ONVIF if available</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        
        <div className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={onRetry}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
          
          <Button
            className="w-full"
            variant="default"
            size="sm"
            onClick={() => {
              // Open camera settings dialog
              const configButton = document.querySelector('[aria-label="Configure Camera Settings"]') as HTMLButtonElement;
              if (configButton) configButton.click();
              
              // Alternatively, navigate to settings page
              const settingsLink = document.querySelector('a[href$="settings"]') as HTMLAnchorElement;
              if (settingsLink && !configButton) settingsLink.click();
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Camera Settings
          </Button>
          
          {camera.ipAddress && (
            <Button
              className="w-full"
              variant="ghost"
              size="sm"
              onClick={() => {
                window.open(`http://${camera.ipAddress}`, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Camera Web Interface
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
