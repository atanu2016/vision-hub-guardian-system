
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Check, HardDrive, Server } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getStorageSettings, saveStorageSettings } from "@/data/mockData";
import { StorageSettings as StorageSettingsType } from "@/types/camera";

const StorageSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("local");
  const [isSaving, setIsSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState<boolean | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<StorageSettingsType>({
    type: "local",
    path: "/recordings",
    retentionDays: 30,
    overwriteOldest: true
  });
  
  // Load settings from API on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getStorageSettings();
        if (settings) {
          setFormData(settings);
          setActiveTab(settings.type || "local");
        }
      } catch (error) {
        console.error('Error fetching storage settings:', error);
        toast({
          title: "Error loading settings",
          description: "Could not load storage settings.",
          variant: "destructive",
        });
      }
    };
    
    fetchSettings();
  }, [toast]);

  const handleInputChange = (key: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Prepare the settings object based on the active tab
    const settings: StorageSettingsType = {
      ...formData,
      type: activeTab as "local" | "nas" | "s3"
    };
    
    try {
      await saveStorageSettings(settings);
      toast({
        title: "Settings saved",
        description: "Storage settings have been updated successfully."
      });
    } catch (error) {
      console.error('Error saving storage settings:', error);
      toast({
        title: "Error",
        description: "Failed to save storage settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setConnectSuccess(null);
    
    // Simulate testing connection
    setTimeout(() => {
      if (activeTab === 'nas') {
        const success = formData.nasAddress && formData.nasPath;
        setConnectSuccess(!!success);
      } else if (activeTab === 's3') {
        const success = formData.s3Bucket && formData.s3AccessKey && formData.s3SecretKey;
        setConnectSuccess(!!success);
      } else {
        setConnectSuccess(true);
      }
      setTestingConnection(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Storage Settings</h1>
        <p className="text-muted-foreground">
          Configure where and how your camera recordings are stored
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="local">
            <HardDrive className="mr-2 h-4 w-4" />
            Local Storage
          </TabsTrigger>
          <TabsTrigger value="nas">
            <Server className="mr-2 h-4 w-4" />
            NAS
          </TabsTrigger>
          <TabsTrigger value="s3">
            <svg 
              className="mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12h2l2-4 2 4h2" />
              <path d="M18 16h-6l-2-4-2 4H4" />
              <path d="M22 12h-4l-2 4-2-4h-4" />
            </svg>
            S3 Compatible
          </TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          <TabsContent value="local">
            <Card>
              <CardHeader>
                <CardTitle>Local Storage Settings</CardTitle>
                <CardDescription>
                  Configure local disk storage for your recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="local-path">Storage Path</Label>
                  <Input
                    id="local-path"
                    value={formData.path || ''}
                    onChange={(e) => handleInputChange('path', e.target.value)}
                    placeholder="/var/lib/vision-hub/recordings"
                  />
                  <p className="text-sm text-muted-foreground">
                    The directory where recordings will be saved
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention-days">Retention Period (days)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    value={formData.retentionDays || 30}
                    onChange={(e) => handleInputChange('retentionDays', parseInt(e.target.value) || 30)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="overwrite"
                    checked={!!formData.overwriteOldest}
                    onCheckedChange={(checked) => handleInputChange('overwriteOldest', checked)}
                  />
                  <Label htmlFor="overwrite">Automatically overwrite oldest recordings when storage is full</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="nas">
            <Card>
              <CardHeader>
                <CardTitle>NAS Storage Settings</CardTitle>
                <CardDescription>
                  Configure Network Attached Storage for your recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nas-address">NAS Address</Label>
                    <Input
                      id="nas-address"
                      value={formData.nasAddress || ''}
                      onChange={(e) => handleInputChange('nasAddress', e.target.value)}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nas-path">Share Path</Label>
                    <Input
                      id="nas-path"
                      value={formData.nasPath || ''}
                      onChange={(e) => handleInputChange('nasPath', e.target.value)}
                      placeholder="/recordings"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nas-username">Username (optional)</Label>
                    <Input
                      id="nas-username"
                      value={formData.nasUsername || ''}
                      onChange={(e) => handleInputChange('nasUsername', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nas-password">Password (optional)</Label>
                    <Input
                      id="nas-password"
                      type="password"
                      value={formData.nasPassword || ''}
                      onChange={(e) => handleInputChange('nasPassword', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nas-retention-days">Retention Period (days)</Label>
                  <Input
                    id="nas-retention-days"
                    type="number"
                    value={formData.retentionDays || 30}
                    onChange={(e) => handleInputChange('retentionDays', parseInt(e.target.value) || 30)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="nas-overwrite"
                    checked={!!formData.overwriteOldest}
                    onCheckedChange={(checked) => handleInputChange('overwriteOldest', checked)}
                  />
                  <Label htmlFor="nas-overwrite">Automatically overwrite oldest recordings when storage is full</Label>
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  className="mt-2"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? "Testing..." : "Test Connection"}
                </Button>
                {connectSuccess !== null && (
                  <Alert variant={connectSuccess ? "default" : "destructive"}>
                    {connectSuccess ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {connectSuccess 
                        ? "Successfully connected to NAS" 
                        : "Failed to connect to NAS. Please check credentials and try again."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="s3">
            <Card>
              <CardHeader>
                <CardTitle>S3 Compatible Storage</CardTitle>
                <CardDescription>
                  Configure cloud storage for your recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="s3-endpoint">Endpoint URL</Label>
                    <Input
                      id="s3-endpoint"
                      value={formData.s3Endpoint || ''}
                      onChange={(e) => handleInputChange('s3Endpoint', e.target.value)}
                      placeholder="https://s3.amazonaws.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s3-bucket">Bucket Name</Label>
                    <Input
                      id="s3-bucket"
                      value={formData.s3Bucket || ''}
                      onChange={(e) => handleInputChange('s3Bucket', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="s3-access-key">Access Key</Label>
                    <Input
                      id="s3-access-key"
                      value={formData.s3AccessKey || ''}
                      onChange={(e) => handleInputChange('s3AccessKey', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s3-secret-key">Secret Key</Label>
                    <Input
                      id="s3-secret-key"
                      type="password"
                      value={formData.s3SecretKey || ''}
                      onChange={(e) => handleInputChange('s3SecretKey', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3-region">Region</Label>
                  <Input
                    id="s3-region"
                    value={formData.s3Region || ''}
                    onChange={(e) => handleInputChange('s3Region', e.target.value)}
                    placeholder="us-east-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3-retention-days">Retention Period (days)</Label>
                  <Input
                    id="s3-retention-days"
                    type="number"
                    value={formData.retentionDays || 30}
                    onChange={(e) => handleInputChange('retentionDays', parseInt(e.target.value) || 30)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  className="mt-2"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? "Testing..." : "Test Connection"}
                </Button>
                {connectSuccess !== null && (
                  <Alert variant={connectSuccess ? "default" : "destructive"}>
                    {connectSuccess ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {connectSuccess 
                        ? "Successfully connected to S3 storage" 
                        : "Failed to connect to S3. Please check credentials and try again."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <CardFooter className="flex justify-end pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Tabs>
    </div>
  );
};

export default StorageSettings;
