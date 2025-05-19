
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CameraMetadataFormProps {
  model: string;
  manufacturer: string;
  onChange: (field: string, value: string) => void;
}

const CameraMetadataForm = ({
  model,
  manufacturer,
  onChange,
}: CameraMetadataFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="model">Model (Optional)</Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => onChange("model", e.target.value)}
          placeholder="DS-2CD2385G1-I"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="manufacturer">Manufacturer (Optional)</Label>
        <Input
          id="manufacturer"
          value={manufacturer}
          onChange={(e) => onChange("manufacturer", e.target.value)}
          placeholder="Hikvision"
        />
      </div>
    </div>
  );
};

export default CameraMetadataForm;
