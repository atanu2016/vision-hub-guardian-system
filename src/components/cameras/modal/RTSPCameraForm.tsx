
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

interface RTSPCameraFormProps {
  rtspUrl: string;
  onChange: (field: string, value: string) => void;
}

const RTSPCameraForm = ({ rtspUrl, onChange }: RTSPCameraFormProps) => {
  console.log("RTSPCameraForm rendered with rtspUrl:", rtspUrl);
  
  const handleRtspUrlChange = (value: string) => {
    const trimmedValue = value.trim();
    console.log("RTSP URL change:", trimmedValue);
    onChange('rtspUrl', trimmedValue);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="rtspUrl" className="block text-sm font-medium mb-1">
          RTSP URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="rtspUrl"
          value={rtspUrl || ""}
          onChange={(e) => handleRtspUrlChange(e.target.value)}
          placeholder="rtsp://username:password@192.168.1.100:5543/stream"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Format: rtsp://username:password@camera-ip:5543/path
        </p>
      </div>
      
      <div className="bg-muted p-3 rounded-md">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">Common RTSP URL formats (Port 5543):</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Hikvision: rtsp://username:password@ip:5543/Streaming/Channels/101</li>
              <li>Dahua: rtsp://username:password@ip:5543/cam/realmonitor?channel=1&subtype=0</li>
              <li>Amcrest: rtsp://username:password@ip:5543/cam/realmonitor?channel=1&subtype=1</li>
              <li>Reolink: rtsp://username:password@ip:5543/h264Preview_01_main</li>
              <li>Generic: rtsp://username:password@ip:5543/stream</li>
            </ul>
            <p className="mt-2 font-medium">Note: Using port 5543 instead of standard 554 for better compatibility.</p>
            <p className="mt-1">You may need to check your camera's documentation for the exact RTSP path and enable RTSP in camera settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RTSPCameraForm;
