
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HLSCameraFormProps {
  hlsUrl: string;
  onChange: (field: string, value: string) => void;
}

const HLSCameraForm = ({
  hlsUrl,
  onChange,
}: HLSCameraFormProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="hlsUrl">HLS URL*</Label>
      <Input
        id="hlsUrl"
        value={hlsUrl}
        onChange={(e) => onChange("hlsUrl", e.target.value)}
        placeholder="https://server/stream.m3u8"
        required
      />
      <p className="text-xs text-muted-foreground mt-1">
        Example: https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
      </p>
    </div>
  );
};

export default HLSCameraForm;
