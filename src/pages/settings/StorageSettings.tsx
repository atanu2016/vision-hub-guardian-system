import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import DatabaseSettings from "@/components/settings/DatabaseSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { HardDrive, Server, Cloud, Info } from "lucide-react";

const localStorageSchema = z.object({
  type: z.literal("local"),
  path: z.string().min(1, "Storage path is required"),
  retentionDays: z.coerce.number().int().min(1, "Retention days must be at least 1"),
  overwriteOldest: z.boolean(),
});

const nasStorageSchema = z.object({
  type: z.literal("nas"),
  nasAddress: z.string()
    .min(1, "NAS address is required")
    .refine(val => {
      // Check for valid IP or hostname format
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const hostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
      return ipRegex.test(val) || hostnameRegex.test(val);
    }, "Please enter a valid IP address or hostname"),
  nasPath: z.string().min(1, "NAS path is required"),
  nasUsername: z.string().min(1, "Username is required"),
  nasPassword: z.string().min(1, "Password is required"),
  retentionDays: z.coerce.number().int().min(1, "Retention days must be at least 1"),
  overwriteOldest: z.boolean(),
});

const cloudStorageSchema = z.object({
  type: z.literal("cloud"),
  cloudProvider: z.enum(["aws", "azure", "gcp"]),
  cloudRegion: z.string().min(1, "Region is required"),
  cloudBucket: z.string().min(1, "Bucket name is required"),
  cloudKey: z.string().min(1, "Access key is required"),
  cloudSecret: z.string().min(1, "Secret key is required"),
  retentionDays: z.coerce.number().int().min(1, "Retention days must be at least 1"),
  overwriteOldest: z.boolean(),
});

const storageSchema = z.discriminatedUnion("type", [
  localStorageSchema,
  nasStorageSchema,
  cloudStorageSchema
]);

type StorageFormValues = z.infer<typeof storageSchema>;

const StorageSettings = () => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("local");
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectionTesting, setIsConnectionTesting] = useState(false);
  
  // Get initial form values from localStorage or use defaults
  const getInitialValues = (): StorageFormValues => {
    const savedSettings = localStorage.getItem("vision-hub-storage-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setActiveTab(parsed.type);
        return parsed;
      } catch (error) {
        console.error("Failed to parse saved storage settings:", error);
      }
    }
    
    return {
      type: "local",
      path: "/var/lib/vision-hub/recordings",
      retentionDays: 30,
      overwriteOldest: true,
    };
  };
  
  const form = useForm<StorageFormValues>({
    resolver: zodResolver(storageSchema),
    defaultValues: getInitialValues(),
  });
  
  const watchStorageType = form.watch("type");

  // Update form values when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Set default values based on tab
    if (value === "local" && watchStorageType !== "local") {
      form.reset({
        type: "local",
        path: "/var/lib/vision-hub/recordings",
        retentionDays: 30,
        overwriteOldest: true,
      });
    } else if (value === "nas" && watchStorageType !== "nas") {
      form.reset({
        type: "nas",
        nasAddress: "",
        nasPath: "/recordings",
        nasUsername: "",
        nasPassword: "",
        retentionDays: 30,
        overwriteOldest: true,
      });
    } else if (value === "cloud" && watchStorageType !== "cloud") {
      form.reset({
        type: "cloud",
        cloudProvider: "aws",
        cloudRegion: "us-east-1",
        cloudBucket: "",
        cloudKey: "",
        cloudSecret: "",
        retentionDays: 30,
        overwriteOldest: true,
      });
    }
    
    // Reset form validation state
    form.clearErrors();
  };

  const onSubmit = (data: StorageFormValues) => {
    setIsSaving(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Store in localStorage
      localStorage.setItem("vision-hub-storage-settings", JSON.stringify(data));
      
      setIsSaving(false);
      
      toast({
        title: "Storage Settings Saved",
        description: "Your storage configuration has been updated",
      });
      
      addNotification({
        title: "Storage Configuration Updated",
        message: `Storage configuration updated to use ${
          data.type === "local" ? "local storage" : 
          data.type === "nas" ? "NAS storage" : 
          "cloud storage"
        }`,
        type: "success"
      });
    }, 1000);
  };
  
  const testNasConnection = () => {
    setIsConnectionTesting(true);
    
    // Get current NAS settings
    const nasData = form.getValues();
    
    // Simulate connection test
    setTimeout(() => {
      setIsConnectionTesting(false);
      
      toast({
        title: "NAS Connection Test",
        description: "Successfully connected to NAS server",
      });
    }, 1500);
  };
  
  const testCloudConnection = () => {
    setIsConnectionTesting(true);
    
    // Get current cloud settings
    const cloudData = form.getValues();
    
    // Check if the current type is cloud before accessing cloud-specific properties
    if (cloudData.type === "cloud") {
      // Simulate connection test
      setTimeout(() => {
        setIsConnectionTesting(false);
        
        toast({
          title: "Cloud Connection Test",
          description: `Successfully connected to ${cloudData.cloudProvider} cloud storage`,
        });
      }, 1500);
    } else {
      setIsConnectionTesting(false);
      toast({
        title: "Error",
        description: "Cannot test connection: not in cloud storage mode",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storage Settings</h1>
          <p className="text-muted-foreground">
            Configure how and where your recordings and data are stored
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>
                  Current usage of your storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">Recordings</div>
                      <div className="text-sm text-muted-foreground">80% (800GB / 1TB)</div>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">Snapshots</div>
                      <div className="text-sm text-muted-foreground">35% (35GB / 100GB)</div>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">Configuration</div>
                      <div className="text-sm text-muted-foreground">10% (1GB / 10GB)</div>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                  
                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">Est. Time Remaining</span>
                        <span className="text-lg font-medium">14 days</span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">Auto Cleanup</span>
                        <span className="text-lg font-medium">Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Storage Configuration</CardTitle>
                <CardDescription>
                  Configure where recordings and data will be stored
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Type</FormLabel>
                          <Tabs 
                            defaultValue={activeTab} 
                            value={activeTab} 
                            onValueChange={handleTabChange}
                            className="w-full"
                          >
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="local" className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4" />
                                <span>Local</span>
                              </TabsTrigger>
                              <TabsTrigger value="nas" className="flex items-center gap-2">
                                <Server className="h-4 w-4" />
                                <span>NAS</span>
                              </TabsTrigger>
                              <TabsTrigger value="cloud" className="flex items-center gap-2">
                                <Cloud className="h-4 w-4" />
                                <span>Cloud</span>
                              </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="local" className="pt-4 space-y-4">
                              <FormField
                                control={form.control}
                                name="path"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Storage Path</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Path to local directory where recordings will be stored
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TabsContent>
                            
                            <TabsContent value="nas" className="pt-4 space-y-4">
                              <FormField
                                control={form.control}
                                name="nasAddress"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>NAS Address</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="192.168.1.100 or nas.local" />
                                    </FormControl>
                                    <FormDescription className="flex items-center gap-1">
                                      <Info className="h-3 w-3" />
                                      IP address or hostname of the NAS device
                                    </FormDescription>
                                    <FormMessage />
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
                                      <Input {...field} placeholder="/recordings or \\recordings" />
                                    </FormControl>
                                    <FormDescription>
                                      Path to the shared folder on the NAS
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="nasUsername"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>NAS Username</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
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
                                        <Input type="password" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="mt-2" 
                                onClick={testNasConnection}
                                disabled={isConnectionTesting}
                              >
                                {isConnectionTesting ? "Testing Connection..." : "Test NAS Connection"}
                              </Button>
                            </TabsContent>
                            
                            <TabsContent value="cloud" className="pt-4 space-y-4">
                              <FormField
                                control={form.control}
                                name="cloudProvider"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cloud Provider</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a cloud provider" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="aws">AWS S3</SelectItem>
                                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                                        <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      Select your cloud storage provider
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cloudRegion"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Region</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="us-east-1, us-central1, etc." />
                                    </FormControl>
                                    <FormDescription>
                                      Cloud region where storage is located
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cloudBucket"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bucket Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="my-vision-hub-recordings" />
                                    </FormControl>
                                    <FormDescription>
                                      Name of the bucket/container for recordings
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cloudKey"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Access Key/ID</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Your cloud provider access key or client ID
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cloudSecret"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Secret Key</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Your cloud provider secret key
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="mt-2" 
                                onClick={testCloudConnection}
                                disabled={isConnectionTesting}
                              >
                                {isConnectionTesting ? "Testing Connection..." : "Test Cloud Connection"}
                              </Button>
                            </TabsContent>
                          </Tabs>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="retentionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retention Period (Days)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Overwrite Oldest Recordings</FormLabel>
                            <FormDescription>
                              When storage is full, automatically delete oldest recordings
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Storage Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Database Configuration</h2>
          <DatabaseSettings />
        </div>
      </div>
    </AppLayout>
  );
};

export default StorageSettings;
