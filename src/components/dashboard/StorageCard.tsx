
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HardDrive, RefreshCw, Cloud, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseStorageValue } from "@/utils/storageUtils";

interface StorageCardProps {
  storageUsed: string;
  storageTotal: string;
  storagePercentage: number;
  storageType?: string;
  uptimeHours: number;
  onRefresh?: () => void;
}

const StorageCard = ({ 
  storageUsed, 
  storageTotal, 
  storagePercentage, 
  storageType = "local",
  uptimeHours,
  onRefresh 
}: StorageCardProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState("14 Days");

  useEffect(() => {
    calculateRecordingTimeLeft();
  }, [storageUsed, storageTotal]);

  const calculateRecordingTimeLeft = () => {
    try {
      // Calculate remaining days based on used space and total space
      const used = parseStorageValue(storageUsed);
      const total = parseStorageValue(storageTotal);
      const free = total - used;
      
      // Roughly estimate how many days of recording are left
      // Assuming an average of 10GB per day for recordings
      const avgDailyUsage = 10; // GB per day
      const daysLeft = Math.max(0, Math.floor(free / avgDailyUsage));
      
      if (daysLeft > 365) {
        setRecordingTimeLeft("Over 1 Year");
      } else if (daysLeft > 30) {
        setRecordingTimeLeft(`${Math.floor(daysLeft / 30)} Months`);
      } else {
        setRecordingTimeLeft(`${daysLeft} Days`);
      }
    } catch (error) {
      console.error("Error calculating recording time left:", error);
      setRecordingTimeLeft("Unknown");
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  // Get appropriate storage icon based on type
  const getStorageTypeIcon = () => {
    switch (storageType) {
      case 'nas':
        return <Database className="h-4 w-4" />;
      case 's3':
      case 'dropbox':
      case 'google_drive':
      case 'onedrive':
      case 'azure_blob':
      case 'backblaze':
        return <Cloud className="h-4 w-4" />;
      default:
        return <HardDrive className="h-4 w-4" />;
    }
  };

  // Get color based on usage percentage
  const getUsageColor = () => {
    if (storagePercentage >= 90) return 'bg-red-500';
    if (storagePercentage >= 80) return 'bg-orange-500';
    if (storagePercentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get text color based on usage percentage
  const getUsageTextColor = () => {
    if (storagePercentage >= 90) return 'text-red-600';
    if (storagePercentage >= 80) return 'text-orange-600';
    if (storagePercentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Storage Usage</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1" 
          onClick={() => window.location.href = "/settings/storage"}
        >
          {getStorageTypeIcon()} Details
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              {storageUsed} used of {storageTotal}
            </div>
            <div className="flex items-center gap-1">
              <div className={`text-sm font-medium ${getUsageTextColor()}`}>
                {storagePercentage}%
              </div>
              {onRefresh && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 ml-1" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <Progress value={storagePercentage} className="h-2" />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getUsageColor()}`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Est. Recording Time Left</span>
            <span className="text-2xl font-bold">{recordingTimeLeft}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">System Uptime</span>
            <span className="text-2xl font-bold">{uptimeHours} Hours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageCard;
