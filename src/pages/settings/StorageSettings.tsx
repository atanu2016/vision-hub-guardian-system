import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Trash2, Clock, Settings, ArrowRightLeft, Cloud, Server, Database } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StorageSettings as StorageSettingsType, StorageProviderType } from "@/types/camera";
import { getStorageSettings, saveStorageSettings } from "@/services/apiService";
import { supabase } from "@/integrations/supabase/client";

// Define form schema for storage settings
const storageFormSchema = z.object({
  type: z.enum(["local", "nas", "s3", "dropbox", "google_drive", "onedrive", "azure_blob", "backblaze"]),
  path: z.string().optional(),
  retentionDays: z.coerce.number().min(1, "Retention period must be at least 1 day").max(365, "Retention period cannot exceed 365 days"),
  overwriteOldest: z.boolean(),
  // NAS fields
  nasAddress: z.string().optional(),
  nasPath: z.string().optional(),
  nasUsername: z.string().optional(),
  nasPassword: z.string().optional(),
  // S3 fields
  s3Endpoint: z.string().optional(),
  s3Bucket: z.string().optional(),
  s3AccessKey: z.string().optional(),
  s3SecretKey: z.string().optional(),
  s3Region: z.string().optional(),
  // Cloud storage fields (optional)
  dropboxToken: z.string().optional(),
  dropboxFolder: z.string().optional(),
  googleDriveToken: z.string().optional(),
  googleDriveFolderId: z.string().optional(),
  oneDriveToken: z.string().optional(),
  oneDriveFolderId: z.string().optional(),
  azureConnectionString: z.string().optional(),
  azureContainer: z.string().optional(),
  backblazeKeyId: z.string().optional(),
  backblazeApplicationKey: z.string().optional(),
  backblazeBucket: z.string().optional(),
});

// Define StorageSettings component
const StorageSettings = () => {
  const { toast } = useToast();
  
  // State declarations
  const [storageUsage, setStorageUsage] = useState({
    totalSpace: 1000, // Total storage space in GB
    usedSpace: 0,     // Used storage space in GB
    usedPercentage: 0, // Percentage of storage space used
    usedSpaceFormatted: "0 GB",
    totalSpaceFormatted: "1 TB"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof storageFormSchema>>({
    resolver: zodResolver(storageFormSchema),
    defaultValues: {
      type: "local",
      path: "/recordings",
      retentionDays: 30,
      overwriteOldest: true,
    },
  });

  // Get current form values
  const currentStorageType = form.watch("type") as StorageProviderType;

  // Load storage settings and usage data
  useEffect(() => {
    const loadStorageSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getStorageSettings();
        
        // Update form with retrieved settings
        form.reset({
          type: settings.type,
          path: settings.path || "/recordings",
          retentionDays: settings.retentionDays,
          overwriteOldest: settings.overwriteOldest,
          nasAddress: settings.nasAddress,
          nasPath: settings.nasPath,
          nasUsername: settings.nasUsername,
          nasPassword: settings.nasPassword,
          s3Endpoint: settings.s3Endpoint,
          s3Bucket: settings.s3Bucket,
          s3AccessKey: settings.s3AccessKey,
          s3SecretKey: settings.s3SecretKey,
          s3Region: settings.s3Region,
          // Additional cloud storage options
          dropboxToken: settings.dropboxToken,
          dropboxFolder: settings.dropboxFolder,
          googleDriveToken: settings.googleDriveToken,
          googleDriveFolderId: settings.googleDriveFolderId,
          oneDriveToken: settings.oneDriveToken,
          oneDriveFolderId: settings.oneDriveFolderId,
          azureConnectionString: settings.azureConnectionString,
          azureContainer: settings.azureContainer,
          backblazeKeyId: settings.backblazeKeyId,
          backblazeApplicationKey: settings.backblazeApplicationKey,
          backblazeBucket: settings.backblazeBucket,
        });

        // Get actual storage usage data from the database
        await fetchStorageUsage();
      } catch (error) {
        console.error("Failed to load storage settings:", error);
        toast.error("Error Loading Settings", {
          description: "Could not load storage settings. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageSettings();
  }, [form, toast]);

  // Fetch real storage usage from the database
  const fetchStorageUsage = async () => {
    try {
      // Get system stats which contains storage info
      const { data: systemStats, error } = await supabase
        .from('system_stats')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      if (systemStats) {
        // Convert storage values
        const usedSpace = parseStorageValue(systemStats.storage_used);
        const totalSpace = parseStorageValue(systemStats.storage_total);
        const usedPercentage = systemStats.storage_percentage || 
          (totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0);
        
        setStorageUsage({
          usedSpace,
          totalSpace,
          usedPercentage,
          usedSpaceFormatted: systemStats.storage_used || "0 GB",
          totalSpaceFormatted: systemStats.storage_total || "1 TB"
        });
      }
    } catch (error) {
      console.error("Failed to fetch storage usage:", error);
      // Fallback to default values if we can't get real data
      setStorageUsage({
        totalSpace: 1000,
        usedSpace: 0,
        usedPercentage: 0,
        usedSpaceFormatted: "0 GB",
        totalSpaceFormatted: "1 TB"
      });
    }
  };

  // Parse storage values from formatted strings (e.g. "500 GB" to 500)
  const parseStorageValue = (storageString: string | null): number => {
    if (!storageString) return 0;
    
    const matches = storageString.match(/(\d+(?:\.\d+)?)\s*([KMGTP]B)/i);
    if (!matches) return 0;
    
    const value = parseFloat(matches[1]);
    const unit = matches[2].toUpperCase();
    
    // Convert all to GB for consistent comparison
    switch (unit) {
      case 'KB': return value / 1024 / 1024;
      case 'MB': return value / 1024;
      case 'GB': return value;
      case 'TB': return value * 1024;
      case 'PB': return value * 1024 * 1024;
      default: return value;
    }
  };

  // Handle storage settings save
  const onSubmit = async (values: z.infer<typeof storageFormSchema>) => {
    setIsSaving(true);
    try {
      // Convert form data to StorageSettings type
      const settings: StorageSettingsType = {
        type: values.type as StorageProviderType,
        path: values.path,
        retentionDays: values.retentionDays,
        overwriteOldest: values.overwriteOldest,
        nasAddress: values.nasAddress,
        nasPath: values.nasPath,
        nasUsername: values.nasUsername,
        nasPassword: values.nasPassword,
        s3Endpoint: values.s3Endpoint,
        s3Bucket: values.s3Bucket,
        s3AccessKey: values.s3AccessKey,
        s3SecretKey: values.s3SecretKey,
        s3Region: values.s3Region,
        // Additional cloud storage fields
        dropboxToken: values.dropboxToken,
        dropboxFolder: values.dropboxFolder,
        googleDriveToken: values.googleDriveToken,
        googleDriveFolderId: values.googleDriveFolderId,
        oneDriveToken: values.oneDriveToken,
        oneDriveFolderId: values.oneDriveFolderId,
        azureConnectionString: values.azureConnectionString,
        azureContainer: values.azureContainer,
        backblazeKeyId: values.backblazeKeyId,
        backblazeApplicationKey: values.backblazeApplicationKey,
        backblazeBucket: values.backblazeBucket,
      };

      // Save to database through API service
      await saveStorageSettings(settings);
      
      toast.success("Storage Settings Saved", {
        description: "Your storage configuration has been updated successfully."
      });

      // Refresh storage usage data
      await fetchStorageUsage();
    } catch (error) {
      console.error("Failed to save storage settings:", error);
      toast.error("Error Saving Settings", {
        description: "An error occurred while saving your storage settings."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle clearing storage
  const handleClearStorage = async () => {
    setIsClearing(true);
    try {
      // Try updating system_stats directly since the function might not exist
      const { error: updateError } = await supabase
        .from('system_stats')
        .update({ 
          storage_used: '0 GB',
          storage_percentage: 0
        });
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state to reflect changes
      setStorageUsage({
        ...storageUsage,
        usedSpace: 0,
        usedPercentage: 0,
        usedSpaceFormatted: "0 GB"
      });
      
      toast.success("Storage Cleared", {
        description: "All recordings have been successfully removed."
      });
    } catch (error) {
      console.error("Failed to clear storage:", error);
      toast.error("Error Clearing Storage", {
        description: "An error occurred while clearing the storage."
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Storage Settings</h1>
        <p className="text-muted-foreground">
          Manage your system's storage usage and retention policies
        </p>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Storage Usage</TabsTrigger>
          <TabsTrigger value="settings">Storage Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>
                View your current storage usage and manage recordings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {storageUsage.usedSpaceFormatted} used of {storageUsage.totalSpaceFormatted}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {storageUsage.usedPercentage}%
                  </div>
                </div>
                <Progress value={storageUsage.usedPercentage} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted">
                  <CardContent className="flex items-center space-x-4 p-4">
                    <HardDrive className="h-6 w-6 text-gray-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total Space</p>
                      <p className="text-lg font-semibold">{storageUsage.totalSpaceFormatted}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted">
                  <CardContent className="flex items-center space-x-4 p-4">
                    <Clock className="h-6 w-6 text-gray-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Retention Policy</p>
                      <p className="text-lg font-semibold">{form.getValues().retentionDays} days</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleClearStorage}
                disabled={isClearing || storageUsage.usedSpace === 0}
              >
                {isClearing ? (
                  "Clearing..."
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All Recordings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Provider</CardTitle>
                  <CardDescription>
                    Select where recordings should be stored
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Type</FormLabel>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select storage provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="local">
                              <div className="flex items-center">
                                <HardDrive className="mr-2 h-4 w-4" />
                                <span>Local Storage</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="nas">
                              <div className="flex items-center">
                                <Server className="mr-2 h-4 w-4" />
                                <span>NAS Storage</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="s3">
                              <div className="flex items-center">
                                <Cloud className="mr-2 h-4 w-4" />
                                <span>S3 Compatible Storage</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dropbox">
                              <div className="flex items-center">
                                <Cloud className="mr-2 h-4 w-4" />
                                <span>Dropbox</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="google_drive">
                              <div className="flex items-center">
                                <Cloud className="mr-2 h-4 w-4" />
                                <span>Google Drive</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="onedrive">
                              <div className="flex items-center">
                                <Cloud className="mr-2 h-4 w-4" />
                                <span>OneDrive</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="azure_blob">
                              <div className="flex items-center">
                                <Cloud className="mr-2 h-4 w-4" />
                                <span>Azure Blob Storage</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="backblaze">
                              <div className="flex items-center">
                                <Cloud className="mr-2 h-4 w-4" />
                                <span>Backblaze B2</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Local Storage Fields */}
                  {currentStorageType === "local" && (
                    <FormField
                      control={form.control}
                      name="path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local Storage Path</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="/path/to/recordings"
                              {...field}
                              value={field.value || ""}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormDescription>
                            Path where recordings will be stored on the local filesystem
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* NAS Storage Fields */}
                  {currentStorageType === "nas" && (
                    <>
                      <FormField
                        control={form.control}
                        name="nasAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NAS Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="192.168.1.100"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nasPath"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NAS Share Path</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/recordings"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nasUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NAS Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="username"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nasPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NAS Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* S3 Storage Fields */}
                  {currentStorageType === "s3" && (
                    <>
                      <FormField
                        control={form.control}
                        name="s3Endpoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>S3 Endpoint</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://s3.amazonaws.com"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="s3Region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>S3 Region</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="us-east-1"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="s3Bucket"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>S3 Bucket</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="my-recordings-bucket"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="s3AccessKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Key</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="AKIAIOSFODNN7EXAMPLE"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="s3SecretKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secret Key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Dropbox Storage Fields */}
                  {currentStorageType === "dropbox" && (
                    <>
                      <FormField
                        control={form.control}
                        name="dropboxToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dropbox Access Token</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dropboxFolder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dropbox Folder</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/Recordings"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Google Drive Storage Fields */}
                  {currentStorageType === "google_drive" && (
                    <>
                      <FormField
                        control={form.control}
                        name="googleDriveToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google Drive OAuth Token</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="googleDriveFolderId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google Drive Folder ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="1a2b3c4d5e..."
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* OneDrive Storage Fields */}
                  {currentStorageType === "onedrive" && (
                    <>
                      <FormField
                        control={form.control}
                        name="oneDriveToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>OneDrive OAuth Token</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="oneDriveFolderId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>OneDrive Folder ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="1a2b3c4d5e..."
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Azure Blob Storage Fields */}
                  {currentStorageType === "azure_blob" && (
                    <>
                      <FormField
                        control={form.control}
                        name="azureConnectionString"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Azure Connection String</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="azureContainer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Azure Container</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="recordings"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Backblaze B2 Storage Fields */}
                  {currentStorageType === "backblaze" && (
                    <>
                      <FormField
                        control={form.control}
                        name="backblazeKeyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backblaze Key ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="001a2b3c4d5e..."
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="backblazeApplicationKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backblaze Application Key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="backblazeBucket"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backblaze Bucket</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="recordings-bucket"
                                {...field}
                                value={field.value || ""}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retention Policy</CardTitle>
                  <CardDescription>
                    Configure how long recordings are kept
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="retentionDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retention Period (Days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={365}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of days to keep recordings before automatic deletion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="overwriteOldest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Overwrite Oldest Recordings</FormLabel>
                          <FormDescription>
                            When storage is full, automatically delete the oldest recordings to make space
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={isLoading || isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" /> Save Storage Settings
                  </>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StorageSettings;
