
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CameraConnectionType } from "@/types/camera";

interface ConnectionTypeSelectorProps {
  connectionType: CameraConnectionType;
  onChange: (type: CameraConnectionType) => void;
  disabled?: boolean;
}

const ConnectionTypeSelector = ({
  connectionType,
  onChange,
  disabled = false
}: ConnectionTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="connectionType" className="text-sm font-medium">Connection Type</Label>
      <Select
        value={connectionType || 'ip'}
        onValueChange={(value) => onChange(value as CameraConnectionType)}
        disabled={disabled}
      >
        <SelectTrigger id="connectionType" className="w-full">
          <SelectValue placeholder="Select connection type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ip">IP Camera</SelectItem>
          <SelectItem value="rtsp">RTSP</SelectItem>
          <SelectItem value="rtmp">RTMP</SelectItem>
          <SelectItem value="hls">HLS Stream</SelectItem>
          <SelectItem value="onvif">ONVIF</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ConnectionTypeSelector;
