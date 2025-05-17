
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";

interface DetectionSettingsProps {
  sensitivityLevel: number;
  onChangeSensitivity: (value: number[]) => void;
}

const DetectionSettings = ({
  sensitivityLevel,
  onChangeSensitivity
}: DetectionSettingsProps) => {
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [selectedObjectTypes, setSelectedObjectTypes] = useState<string[]>(["person", "vehicle"]);

  const handleToggleObjectType = (type: string) => {
    if (selectedObjectTypes.includes(type)) {
      setSelectedObjectTypes(selectedObjectTypes.filter(t => t !== type));
    } else {
      setSelectedObjectTypes([...selectedObjectTypes, type]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Detection Settings</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {detectionEnabled ? "Enabled" : "Disabled"}
          </span>
          <Switch 
            checked={detectionEnabled} 
            onCheckedChange={setDetectionEnabled} 
          />
        </div>
      </div>
      
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
            disabled={!detectionEnabled}
          />
          <div className="text-right text-sm">
            {sensitivityLevel}%
          </div>
        </div>
      </div>
      
      <Accordion type="single" collapsible className="w-full border-t pt-2">
        <AccordionItem value="advanced-settings" className="border-b-0">
          <AccordionTrigger className="py-2">
            <h3 className="font-medium text-left">Advanced Detection Settings</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Object Detection</h4>
                <div className="flex flex-wrap gap-2">
                  <Toggle 
                    pressed={selectedObjectTypes.includes("person")} 
                    onPressedChange={() => handleToggleObjectType("person")}
                    size="sm"
                    disabled={!detectionEnabled}
                  >
                    Person
                  </Toggle>
                  <Toggle 
                    pressed={selectedObjectTypes.includes("vehicle")} 
                    onPressedChange={() => handleToggleObjectType("vehicle")}
                    size="sm"
                    disabled={!detectionEnabled}
                  >
                    Vehicle
                  </Toggle>
                  <Toggle 
                    pressed={selectedObjectTypes.includes("animal")} 
                    onPressedChange={() => handleToggleObjectType("animal")}
                    size="sm"
                    disabled={!detectionEnabled}
                  >
                    Animal
                  </Toggle>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" disabled={!detectionEnabled}>Configure Zones</Button>
                <Button variant="outline" disabled={!detectionEnabled}>Detection Rules</Button>
                <Button variant="outline" disabled={!detectionEnabled}>Face Recognition</Button>
                <Button variant="outline" disabled={!detectionEnabled}>Smart Alerts</Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DetectionSettings;
