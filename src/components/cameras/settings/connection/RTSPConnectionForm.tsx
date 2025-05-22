
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info, HelpCircle } from "lucide-react";
import { SettingsConnectionProps } from "../types";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

const RTSPConnectionForm = ({ 
  cameraData, 
  handleChange, 
  disabled = false,
  errors = {}
}: SettingsConnectionProps) => {
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
        value={cameraData.rtmpUrl || ''}
        onChange={(e) => handleChange('rtmpUrl', e.target.value)}
        placeholder="rtsp://ipaddress:port/path"
        className={errors.rtmpUrl ? "border-destructive" : ""}
        disabled={disabled}
      />
      {errors.rtmpUrl && (
        <p className="text-xs text-destructive mt-1">{errors.rtmpUrl}</p>
      )}
      
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
    </div>
  );
};

export default RTSPConnectionForm;
