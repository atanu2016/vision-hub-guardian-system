
import { Eye } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface DetectionSettingsProps {
  sensitivityLevel: number;
  onChangeSensitivityLevel: (value: number) => void;
}

const DetectionSettings = ({
  sensitivityLevel,
  onChangeSensitivityLevel
}: DetectionSettingsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Detection Settings</h2>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Motion Detection Sensitivity</h3>
              <p className="text-sm text-muted-foreground">Adjust sensitivity level for motion detection</p>
            </div>
          </div>
          
          <div className="pt-2 px-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Low</span>
              <span className="text-sm text-muted-foreground">High</span>
            </div>
            <Slider
              value={[sensitivityLevel]}
              min={0}
              max={100}
              step={1}
              onValueChange={(values) => onChangeSensitivityLevel(values[0])}
              className="mb-1"
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">{sensitivityLevel}%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Advanced Detection Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-center h-12">
              Configure Zones
            </Button>
            <Button variant="outline" className="justify-center h-12">
              Detection Rules
            </Button>
            <Button variant="outline" className="justify-center h-12">
              Object Detection
            </Button>
            <Button variant="outline" className="justify-center h-12">
              Face Recognition
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionSettings;
