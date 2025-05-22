
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SettingsConnectionProps } from "../types";

const RTMPConnectionForm = ({ 
  cameraData, 
  handleChange, 
  disabled = false,
  errors = {}
}: SettingsConnectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="rtmpUrl" className="text-sm font-medium">
        RTMP Stream URL <span className="text-destructive">*</span>
      </Label>
      <Input
        id="rtmpUrl"
        value={cameraData.rtmpUrl || ''}
        onChange={(e) => handleChange('rtmpUrl', e.target.value)}
        placeholder="rtmp://server/stream"
        className={errors.rtmpUrl ? "border-destructive" : ""}
        disabled={disabled}
      />
      {errors.rtmpUrl && (
        <p className="text-xs text-destructive mt-1">{errors.rtmpUrl}</p>
      )}
    </div>
  );
};

export default RTMPConnectionForm;
