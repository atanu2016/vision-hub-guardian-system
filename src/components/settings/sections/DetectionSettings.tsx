
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { DetectionSettings as DetectionSettingsType } from "@/services/database/systemSettingsService";

interface DetectionSettingsProps {
  sensitivityLevel: number;
  enabled: boolean;
  objectTypes: string[];
  smartDetection: boolean;
  onChangeSensitivity: (value: number[]) => void;
  onChangeEnabled?: (enabled: boolean) => void;
  onChangeObjectTypes?: (types: string[]) => void;
  onChangeSmartDetection?: (enabled: boolean) => void;
}

const DetectionSettings = ({
  sensitivityLevel,
  enabled = true,
  objectTypes = ["person", "vehicle"],
  smartDetection = false,
  onChangeSensitivity,
  onChangeEnabled,
  onChangeObjectTypes,
  onChangeSmartDetection
}: DetectionSettingsProps) => {
  const handleToggleObjectType = (type: string) => {
    if (!onChangeObjectTypes) return;
    
    if (objectTypes.includes(type)) {
      onChangeObjectTypes(objectTypes.filter(t => t !== type));
    } else {
      onChangeObjectTypes([...objectTypes, type]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Detection Settings</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <Switch 
            checked={enabled} 
            onCheckedChange={onChangeEnabled || (() => {})}
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
            disabled={!enabled}
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
                    pressed={objectTypes.includes("person")} 
                    onPressedChange={() => handleToggleObjectType("person")}
                    size="sm"
                    disabled={!enabled}
                  >
                    Person
                  </Toggle>
                  <Toggle 
                    pressed={objectTypes.includes("vehicle")} 
                    onPressedChange={() => handleToggleObjectType("vehicle")}
                    size="sm"
                    disabled={!enabled}
                  >
                    Vehicle
                  </Toggle>
                  <Toggle 
                    pressed={objectTypes.includes("animal")} 
                    onPressedChange={() => handleToggleObjectType("animal")}
                    size="sm"
                    disabled={!enabled}
                  >
                    Animal
                  </Toggle>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Smart Detection</span>
                  <Switch 
                    checked={smartDetection} 
                    onCheckedChange={onChangeSmartDetection || (() => {})}
                    disabled={!enabled}
                  />
                </div>
              
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" disabled={!enabled}>Configure Zones</Button>
                  <Button variant="outline" disabled={!enabled}>Detection Rules</Button>
                  <Button variant="outline" disabled={!enabled}>Face Recognition</Button>
                  <Button variant="outline" disabled={!enabled}>Smart Alerts</Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DetectionSettings;
