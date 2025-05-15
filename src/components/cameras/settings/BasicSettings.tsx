
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SettingsSectionProps } from "./types";
import { useState } from "react";

const BasicSettings = ({ cameraData, handleChange }: SettingsSectionProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateField = (field: string, value: string) => {
    if (field === 'name' && !value.trim()) {
      setErrors({...errors, [field]: 'Camera name is required'});
      return false;
    }
    
    // Clear error when valid
    const updatedErrors = {...errors};
    delete updatedErrors[field];
    setErrors(updatedErrors);
    return true;
  };

  const handleInputChange = (field: keyof typeof cameraData, value: string) => {
    validateField(field as string, value);
    handleChange(field, value);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">Basic Settings</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Camera Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={cameraData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Input
              id="location"
              value={cameraData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Front Door, Backyard"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium">Model</Label>
            <Input
              id="model"
              value={cameraData.model || ''}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="e.g., HC-V380"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="manufacturer" className="text-sm font-medium">Manufacturer</Label>
            <Input
              id="manufacturer"
              value={cameraData.manufacturer || ''}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              placeholder="e.g., Hikvision, Nest"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicSettings;
