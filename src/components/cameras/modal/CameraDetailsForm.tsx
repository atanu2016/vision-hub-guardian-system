
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback } from "react";

interface CameraDetailsFormProps {
  name: string;
  location: string;
  onChange: (field: string, value: string) => void;
}

const CameraDetailsForm = ({
  name,
  location,
  onChange,
}: CameraDetailsFormProps) => {
  console.log("CameraDetailsForm - Received props - name:", name, "location:", location);
  
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("CameraDetailsForm - Name input change:", newValue);
    onChange("name", newValue);
  }, [onChange]);

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("CameraDetailsForm - Location input change:", newValue);
    onChange("location", newValue);
  }, [onChange]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Camera Name*</Label>
        <Input
          id="name"
          value={name || ""}
          onChange={handleNameChange}
          placeholder="Front Door Camera"
          required
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location*</Label>
        <Input
          id="location"
          value={location || ""}
          onChange={handleLocationChange}
          placeholder="Main Entrance"
          required
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default CameraDetailsForm;
