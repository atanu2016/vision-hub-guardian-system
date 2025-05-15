
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Check, HardDrive, Server, CloudUpload, DropboxLogo } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getStorageSettings, saveStorageSettings } from "@/services/apiService";
import { StorageSettings as StorageSettingsType, StorageProviderType } from "@/types/camera";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StorageSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<StorageProviderType>("local");
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
          description: "Could not load storage settings."
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
      type: activeTab
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
    
    // Testing storage connection based on the active provider
    setTimeout(() => {
      let success = false;
      
      switch (activeTab) {
        case 'local':
          success = !!formData.path;
          break;
        case 'nas':
          success = !!(formData.nasAddress && formData.nasPath);
          break;
        case 's3':
          success = !!(formData.s3Bucket && formData.s3AccessKey && formData.s3SecretKey);
          break;
        case 'dropbox':
          success = !!formData.dropboxToken;
          break;
        case 'google_drive':
          success = !!formData.googleDriveToken;
          break;
        case 'onedrive':
          success = !!formData.oneDriveToken;
          break;
        case 'azure_blob':
          success = !!(formData.azureConnectionString && formData.azureContainer);
          break;
        case 'backblaze':
          success = !!(formData.backblazeKeyId && formData.backblazeApplicationKey && formData.backblazeBucket);
          break;
      }
      
      setConnectSuccess(success);
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
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Storage Provider</CardTitle>
            <CardDescription>
              Select which storage provider you want to use for your recordings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="storage-provider">Storage Provider</Label>
              <Select 
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as StorageProviderType)}
              >
                <SelectTrigger id="storage-provider">
                  <SelectValue placeholder="Select storage provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Storage</SelectItem>
                  <SelectItem value="nas">Network Attached Storage (NAS)</SelectItem>
                  <SelectItem value="s3">S3 Compatible</SelectItem>
                  <SelectItem value="dropbox">Dropbox</SelectItem>
                  <SelectItem value="google_drive">Google Drive</SelectItem>
                  <SelectItem value="onedrive">Microsoft OneDrive</SelectItem>
                  <SelectItem value="azure_blob">Azure Blob Storage</SelectItem>
                  <SelectItem value="backblaze">Backblaze B2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          {activeTab === "local" && (
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
          )}
          
          {activeTab === "nas" && (
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
          )}
          
          {activeTab === "s3" && (
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
          )}
          
          {activeTab === "dropbox" && (
            <Card>
              <CardHeader>
                <CardTitle>Dropbox Storage Settings</CardTitle>
                <CardDescription>
                  Configure Dropbox for your recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dropbox-token">Dropbox Access Token</Label>
                  <Input
                    id="dropbox-token"
                    type="password"
                    value={formData.dropboxToken || ''}
                    onChange={(e) => handleInputChange('dropboxToken', e.target.value)}
                    placeholder="Your Dropbox access token"
                  />
                  <p className="text-sm text-muted-foreground">
                    <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Create a Dropbox app to get your access token
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropbox-folder">Folder Path</Label>
                  <Input
                    id="dropbox-folder"
                    value={formData.dropboxFolder || ''}
                    onChange={(e) => handleInputChange('dropboxFolder', e.target.value)}
                    placeholder="/CameraRecordings"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropbox-retention-days">Retention Period (days)</Label>
                  <Input
                    id="dropbox-retention-days"
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
                        ? "Successfully connected to Dropbox" 
                        : "Failed to connect to Dropbox. Please check your access token and try again."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "google_drive" && (
            <Card>
              <CardHeader>
                <CardTitle>Google Drive Storage Settings</CardTitle>
                <CardDescription>
                  Configure Google Drive for your recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-drive-token">Google Drive OAuth Token</Label>
                  <Input
                    id="google-drive-token"
                    type="password"
                    value={formData.googleDriveToken || ''}
                    onChange={(e) => handleInputChange('googleDriveToken', e.target.value)}
                    placeholder="Your Google Drive OAuth token"
                  />
                  <p className="text-sm text-muted-foreground">
                    <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Create a Google Cloud project to get your OAuth credentials
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-drive-folder-id">Folder ID</Label>
                  <Input
                    id="google-drive-folder-id"
                    value={formData.googleDriveFolderId || ''}
                    onChange={(e) => handleInputChange('googleDriveFolderId', e.target.value)}
                    placeholder="Google Drive folder ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-drive-retention-days">Retention Period (days)</Label>
                  <Input
                    id="google-drive-retention-days"
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
                        ? "Successfully connected to Google Drive" 
                        : "Failed to connect to Google Drive. Please check your token and try again."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "onedrive" && (
            <Card>
              <CardHeader>
                <CardTitle>Microsoft OneDrive Storage Settings</CardTitle>
                <CardDescription>
                  Configure OneDrive for your recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="onedrive-token">OneDrive Access Token</Label>
                  <Input
                    id="onedrive-token"
                    type="password"
                    value={formData.oneDriveToken || ''}
                    onChange={(e) => handleInputChange('oneDriveToken', e.target.value)}
                    placeholder="Your OneDrive access token"
                  />
                  <p className="text-sm text-muted-foreground">
                    <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Register an Azure AD app to get your access token
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onedrive-folder-id">Folder ID</Label>
                  <Input
                    id="onedrive-folder-id"
                    value={formData.oneDriveFolderId || ''}
                    onChange={(e) => handleInputChange('oneDriveFolderId', e.target.value)}
                    placeholder="OneDrive folder ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onedrive-retention-days">Retention Period (days)</Label>
                  <Input
                    id="onedrive-retention-days"
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
                        ? "Successfully connected to OneDrive" 
                        : "Failed to connect to OneDrive. Please check your token and try again."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "azure_blob" && (
            <Card>
              <CardHeader>
                <CardTitle>Azure Blob Storage Settings</CardTitle>
                <CardDescription>
                  Configure Azure Blob Storage for your recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="azure-connection-string">Connection String</Label>
                  <Input
                    id="azure-connection-string"
                    type="password"
                    value={formData.azureConnectionString || ''}
                    onChange={(e) => handleInputChange('azureConnectionString', e.target.value)}
                    placeholder="Your Azure Storage connection string"
                  />
                  <p className="text-sm text-muted-foreground">
                    <a href="https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Get your connection string from the Azure portal
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-container">Container Name</Label>
                  <Input
                    id="azure-container"
                    value={formData.azureContainer || ''}
                    onChange={(e) => handleInputChange('azureContainer', e.target.value)}
                    placeholder="recordings"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-retention-days">Retention Period (days)</Label>
                  <Input
                    id="azure-retention-days"
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
                        ? "Successfully connected to Azure Blob Storage" 
                        : "Failed to connect to Azure Blob Storage. Please check your connection string and try again."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "backblaze" && (
            <Card>
              <CardHeader>
                <CardTitle>Backblaze B2 Storage Settings</CardTitle>
                <CardDescription>
                  Configure Backblaze B2 for your recordings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backblaze-key-id">Application Key ID</Label>
                    <Input
                      id="backblaze-key-id"
                      value={formData.backblazeKeyId || ''}
                      onChange={(e) => handleInputChange('backblazeKeyId', e.target.value)}
                      placeholder="Your Backblaze key ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backblaze-application-key">Application Key</Label>
                    <Input
                      id="backblaze-application-key"
                      type="password"
                      value={formData.backblazeApplicationKey || ''}
                      onChange={(e) => handleInputChange('backblazeApplicationKey', e.target.value)}
                      placeholder="Your Backblaze application key"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backblaze-bucket">Bucket Name</Label>
                  <Input
                    id="backblaze-bucket"
                    value={formData.backblazeBucket || ''}
                    onChange={(e) => handleInputChange('backblazeBucket', e.target.value)}
                    placeholder="your-bucket-name"
                  />
                  <p className="text-sm text-muted-foreground">
                    <a href="https://www.backblaze.com/b2/cloud-storage.html#af9kre" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Create a Backblaze B2 account to get your keys
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backblaze-retention-days">Retention Period (days)</Label>
                  <Input
                    id="backblaze-retention-days"
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
                        ? "Successfully connected to Backblaze B2" 
                        : "Failed to connect to Backblaze B2. Please check your credentials and try again."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <CardFooter className="flex justify-end pt-6 mt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </div>
      </form>
    </div>
  );
};

export default StorageSettings;
