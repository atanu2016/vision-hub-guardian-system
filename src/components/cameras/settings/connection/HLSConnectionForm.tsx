
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SettingsConnectionProps } from "../types";

const HLSConnectionForm = ({ 
  cameraData, 
  handleChange, 
  disabled = false,
  errors = {}
}: SettingsConnectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="hlsUrl" className="text-sm font-medium">
        HLS Stream URL <span className="text-destructive">*</span>
      </Label>
      <Input
        id="hlsUrl"
        value={cameraData.hlsUrl || ''}
        onChange={(e) => handleChange('hlsUrl', e.target.value)}
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
  );
};

export default HLSConnectionForm;
