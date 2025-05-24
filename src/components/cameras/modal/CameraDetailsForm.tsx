
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
  console.log("CameraDetailsForm - Received props - name:", name, "location:", location);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("CameraDetailsForm - Name input change:", newValue);
    onChange("name", newValue);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("CameraDetailsForm - Location input change:", newValue);
    onChange("location", newValue);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Camera Name*</Label>
        <Input
          id="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Front Door Camera"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location*</Label>
        <Input
          id="location"
          value={location}
          onChange={handleLocationChange}
          placeholder="Main Entrance"
          required
        />
      </div>
    </div>
  );
};

export default CameraDetailsForm;
