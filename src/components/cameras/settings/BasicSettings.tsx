
import { Camera } from "@/types/camera";
import { SettingsSectionProps } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CameraGroupSelector from "../detail/CameraGroupSelector";

const BasicSettings = ({ cameraData, handleChange }: SettingsSectionProps) => {
  const handleGroupChange = (group: string) => {
    handleChange('group', group);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Basic Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="camera-name" className="required-field">Camera Name</Label>
          <Input
            id="camera-name"
            value={cameraData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter camera name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="camera-location">Location</Label>
          <Input
            id="camera-location"
            value={cameraData.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Enter camera location"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="camera-model">Model</Label>
          <Input
            id="camera-model"
            value={cameraData.model || ''}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="Camera model"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="camera-manufacturer">Manufacturer</Label>
          <Input
            id="camera-manufacturer"
            value={cameraData.manufacturer || ''}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
            placeholder="Camera manufacturer"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <CameraGroupSelector 
          cameraId={cameraData.id} 
          currentGroup={cameraData.group || null} 
          onGroupChange={handleGroupChange}
        />
      </div>
    </div>
  );
};

export default BasicSettings;
