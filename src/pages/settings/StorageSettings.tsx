
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getStorageSettings, saveStorageSettings } from "@/data/mockData";
import { StorageSettings as StorageSettingsType } from "@/types/camera";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const StorageSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StorageSettingsType>(() => {
    return getStorageSettings();
  });

  // Local form state
  const [formData, setFormData] = useState({
    type: settings.type,
    path: settings.path || "/recordings",
    nasAddress: settings.nasAddress || "",
    nasUsername: settings.nasUsername || "",
    nasPassword: settings.nasPassword || "",
    cloudProvider: settings.cloudProvider || "aws",
    cloudKey: settings.cloudKey || "",
    cloudSecret: settings.cloudSecret || "",
    cloudBucket: settings.cloudBucket || "",
    cloudRegion: settings.cloudRegion || "us-east-1",
    overwriteOldest: true,
    retentionDays: "30"
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    nasAddress?: string;
    cloudCredentials?: string;
    path?: string;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (name in validationErrors) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name as keyof typeof validationErrors];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation errors when changing type
    if (name === 'type') {
      setValidationErrors({});
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateSettings = () => {
    const newErrors: {
      nasAddress?: string;
      cloudCredentials?: string;
      path?: string;
    } = {};
    
    if (formData.type === 'local') {
      if (!formData.path) {
        newErrors.path = "Local path is required";
      }
    } else if (formData.type === 'nas') {
      if (!formData.nasAddress) {
        newErrors.nasAddress = "NAS server address is required";
      } else if (!formData.nasAddress.includes(':') && !formData.nasAddress.includes('/')) {
        newErrors.nasAddress = "Invalid NAS address format. Expected format: server:/path or server/path";
      }
    } else if (formData.type === 'cloud') {
      const hasAllCloudFields = formData.cloudKey && formData.cloudSecret && formData.cloudBucket;
      if (!hasAllCloudFields) {
        newErrors.cloudCredentials = "Cloud credentials and bucket name are required";
      }
    }
    
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSettings = () => {
    if (!validateSettings()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors before saving",
        variant: "destructive",
      });
      return;
    }

    // Save settings
    const newSettings: StorageSettingsType = {
      type: formData.type,
      path: formData.path,
      nasAddress: formData.nasAddress,
      nasUsername: formData.nasUsername,
      nasPassword: formData.nasPassword,
      cloudProvider: formData.cloudProvider,
      cloudKey: formData.cloudKey,
      cloudSecret: formData.cloudSecret,
      cloudBucket: formData.cloudBucket,
      cloudRegion: formData.cloudRegion,
    };

    setSettings(newSettings);
    saveStorageSettings(newSettings);

    toast({
      title: "Settings Saved",
      description: "Storage settings have been updated successfully"
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storage Settings</h1>
          <p className="text-muted-foreground">
            Configure how and where camera recordings are stored
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Storage Location</CardTitle>
            <CardDescription>
              Choose where to store your camera recordings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storageType">Storage Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger id="storageType">
                  <SelectValue placeholder="Select storage location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Drive</SelectItem>
                  <SelectItem value="nas">Network Attached Storage (NAS)</SelectItem>
                  <SelectItem value="cloud">Cloud Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.type === "local" && (
              <div className="space-y-2">
                <Label htmlFor="localPath">Local Path</Label>
                <Input 
                  id="localPath"
                  name="path"
                  value={formData.path}
                  onChange={handleInputChange}
                  placeholder="/recordings"
                  className={validationErrors.path ? "border-destructive" : ""}
                />
                {validationErrors.path && (
                  <p className="text-sm text-destructive">{validationErrors.path}</p>
                )}
              </div>
            )}
            
            {formData.type === "nas" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nasAddress">NAS Server Address</Label>
                  <Input 
                    id="nasAddress"
                    name="nasAddress"
                    value={formData.nasAddress}
                    onChange={handleInputChange}
                    placeholder="192.168.1.100:/share"
                    className={validationErrors.nasAddress ? "border-destructive" : ""}
                  />
                  {validationErrors.nasAddress && (
                    <p className="text-sm text-destructive">{validationErrors.nasAddress}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Format: server:/path or server/path (e.g., 192.168.1.100:/share)
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nasUsername">Username</Label>
                    <Input 
                      id="nasUsername"
                      name="nasUsername"
                      value={formData.nasUsername}
                      onChange={handleInputChange}
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nasPassword">Password</Label>
                    <Input 
                      id="nasPassword"
                      name="nasPassword"
                      type="password"
                      value={formData.nasPassword}
                      onChange={handleInputChange}
                      placeholder="password"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {formData.type === "cloud" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cloudProvider">Cloud Provider</Label>
                  <Select 
                    value={formData.cloudProvider} 
                    onValueChange={(value) => handleSelectChange("cloudProvider", value)}
                  >
                    <SelectTrigger id="cloudProvider">
                      <SelectValue placeholder="Select cloud provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="google">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cloudRegion">Region</Label>
                  <Select 
                    value={formData.cloudRegion} 
                    onValueChange={(value) => handleSelectChange("cloudRegion", value)}
                  >
                    <SelectTrigger id="cloudRegion">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-1">US West (N. California)</SelectItem>
                      <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cloudBucket">Bucket Name</Label>
                  <Input 
                    id="cloudBucket"
                    name="cloudBucket"
                    value={formData.cloudBucket}
                    onChange={handleInputChange}
                    placeholder="my-recordings-bucket"
                    className={validationErrors.cloudCredentials ? "border-destructive" : ""}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cloudKey">API Key</Label>
                    <Input 
                      id="cloudKey"
                      name="cloudKey"
                      value={formData.cloudKey}
                      onChange={handleInputChange}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      className={validationErrors.cloudCredentials ? "border-destructive" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloudSecret">API Secret</Label>
                    <Input 
                      id="cloudSecret"
                      name="cloudSecret"
                      type="password"
                      value={formData.cloudSecret}
                      onChange={handleInputChange}
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      className={validationErrors.cloudCredentials ? "border-destructive" : ""}
                    />
                  </div>
                </div>
                
                {validationErrors.cloudCredentials && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validationErrors.cloudCredentials}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="retentionDays">Retention Period (Days)</Label>
              <Input 
                id="retentionDays"
                name="retentionDays"
                type="number" 
                value={formData.retentionDays}
                onChange={handleInputChange}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Recordings older than this will be automatically deleted
              </p>
            </div>
            
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="overwriteOldest">Overwrite Oldest Recordings</Label>
                <p className="text-sm text-muted-foreground">
                  When storage is full, overwrite oldest recordings
                </p>
              </div>
              <Switch 
                id="overwriteOldest" 
                checked={formData.overwriteOldest}
                onCheckedChange={(checked) => handleSwitchChange("overwriteOldest", checked)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StorageSettings;
