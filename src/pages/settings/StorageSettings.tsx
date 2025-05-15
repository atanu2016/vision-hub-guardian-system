import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast, useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Trash2, Clock, Settings, ArrowRightLeft } from "lucide-react";

// Define StorageSettings component
const StorageSettings = () => {
  // State declarations
  const [storageUsage, setStorageUsage] = useState({
    totalSpace: 1000, // Total storage space in GB
    usedSpace: 600,   // Used storage space in GB
    usedPercentage: 60, // Percentage of storage space used
    usedSpaceFormatted: "600 GB",
    totalSpaceFormatted: "1 TB"
  });

  const [retentionPolicy, setRetentionPolicy] = useState("7 days");
  const [autoOptimize, setAutoOptimize] = useState(true);

  // Handle storage settings save
  const handleSaveStorageSettings = async () => {
    try {
      // Simulate API call to save storage settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast("Storage Settings Saved", {
        description: "Your storage configuration has been updated successfully."
      });
    } catch (error) {
      console.error("Failed to save storage settings:", error);
      toast("Error Saving Settings", {
        description: "An error occurred while saving your storage settings.",
        variant: "destructive"
      });
    }
  };

  const handleClearStorage = async () => {
    try {
      // Simulate API call to clear storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state to reflect changes
      setStorageUsage({
        ...storageUsage,
        usedSpace: 0,
        usedPercentage: 0,
        usedSpaceFormatted: "0 GB"
      });
      
      toast("Storage Cleared", {
        description: "All recordings have been successfully removed."
      });
    } catch (error) {
      console.error("Failed to clear storage:", error);
      toast("Error Clearing Storage", {
        description: "An error occurred while clearing the storage.",
        variant: "destructive"
      });
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
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                      <p className="text-lg font-semibold">{retentionPolicy}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button variant="destructive" className="w-full" onClick={handleClearStorage}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Recordings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>
                Configure your storage settings and retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retention">Retention Policy</Label>
                <Select
                  value={retentionPolicy}
                  onValueChange={value => setRetentionPolicy(value)}
                >
                  <SelectTrigger id="retention">
                    <SelectValue placeholder="Select retention policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 day">1 Day</SelectItem>
                    <SelectItem value="3 days">3 Days</SelectItem>
                    <SelectItem value="7 days">7 Days</SelectItem>
                    <SelectItem value="14 days">14 Days</SelectItem>
                    <SelectItem value="30 days">30 Days</SelectItem>
                    <SelectItem value="60 days">60 Days</SelectItem>
                    <SelectItem value="90 days">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-optimize">Auto-Optimize Storage</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically optimize storage by compressing older recordings
                  </p>
                </div>
                <Switch
                  id="auto-optimize"
                  checked={autoOptimize}
                  onCheckedChange={checked => setAutoOptimize(checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSaveStorageSettings}>
            <Settings className="mr-2 h-4 w-4" /> Save Storage Settings
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StorageSettings;
