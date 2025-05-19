
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RTMPCameraFormProps {
  rtmpUrl: string;
  onChange: (field: string, value: string) => void;
}

const RTMPCameraForm = ({
  rtmpUrl,
  onChange,
}: RTMPCameraFormProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="rtmpUrl">RTMP URL*</Label>
      <Input
        id="rtmpUrl"
        value={rtmpUrl}
        onChange={(e) => onChange("rtmpUrl", e.target.value)}
        placeholder="rtmp://server:1935/live/stream"
        required
      />
    </div>
  );
};

export default RTMPCameraForm;
