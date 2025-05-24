
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  console.log("CameraDetailsForm - name:", name, "location:", location);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Camera Name*</Label>
        <Input
          id="name"
          value={name || ""}
          onChange={(e) => {
            console.log("Name input change:", e.target.value);
            onChange("name", e.target.value);
          }}
          placeholder="Front Door Camera"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location*</Label>
        <Input
          id="location"
          value={location || ""}
          onChange={(e) => {
            console.log("Location input change:", e.target.value);
            onChange("location", e.target.value);
          }}
          placeholder="Main Entrance"
          required
        />
      </div>
    </div>
  );
};

export default CameraDetailsForm;
