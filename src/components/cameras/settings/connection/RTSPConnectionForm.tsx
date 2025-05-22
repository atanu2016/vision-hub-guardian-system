
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { SettingsConnectionProps } from "../types";

const RTSPConnectionForm = ({ 
  cameraData, 
  handleChange, 
  disabled = false,
  errors = {}
}: SettingsConnectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="streamUrl" className="text-sm font-medium">
        RTSP Stream URL <span className="text-destructive">*</span>
      </Label>
      <Input
        id="streamUrl"
        value={cameraData.rtmpUrl || ''}
        onChange={(e) => handleChange('rtmpUrl', e.target.value)}
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
  );
};

export default RTSPConnectionForm;
