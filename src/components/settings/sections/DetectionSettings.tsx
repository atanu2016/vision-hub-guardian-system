
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface DetectionSettingsProps {
  sensitivityLevel: number;
  onChangeSensitivity: (value: number[]) => void;
}

const DetectionSettings = ({
  sensitivityLevel,
  onChangeSensitivity
}: DetectionSettingsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Detection Settings</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Motion Detection Sensitivity</h3>
          <p className="text-sm text-muted-foreground">
            Adjust sensitivity level for motion detection
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Low</span>
            <span className="text-sm">High</span>
          </div>
          <Slider 
            value={[sensitivityLevel]} 
            max={100} 
            step={1}
            onValueChange={onChangeSensitivity}
          />
          <div className="text-right text-sm">
            {sensitivityLevel}%
          </div>
        </div>
      </div>
      
      <div className="space-y-4 pt-2">
        <h3 className="font-medium">Advanced Detection Settings</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline">Configure Zones</Button>
          <Button variant="outline">Detection Rules</Button>
          <Button variant="outline">Object Detection</Button>
          <Button variant="outline">Face Recognition</Button>
        </div>
      </div>
    </div>
  );
};

export default DetectionSettings;
