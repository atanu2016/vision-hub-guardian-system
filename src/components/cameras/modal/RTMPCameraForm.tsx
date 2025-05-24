
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
  console.log("RTMPCameraForm rendered with rtmpUrl:", rtmpUrl);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="rtmpUrl">RTMP URL*</Label>
      <Input
        id="rtmpUrl"
        value={rtmpUrl || ""}
        onChange={(e) => {
          console.log("RTMP URL change:", e.target.value);
          onChange("rtmpUrl", e.target.value);
        }}
        placeholder="rtmp://server:1935/live/stream"
        required
      />
    </div>
  );
};

export default RTMPCameraForm;
