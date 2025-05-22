
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Trash2, Clock, RefreshCw, Cloud, Database } from "lucide-react";

interface StorageUsageDisplayProps {
  storageUsage: {
    usedSpace: number;
    totalSpace: number;
    usedPercentage: number;
    usedSpaceFormatted: string;
    totalSpaceFormatted: string;
  };
  retentionDays: number;
  isClearing: boolean;
  storageType: string;
  onClearStorage: () => void;
  onRefreshStorage?: () => void;
}

const StorageUsageDisplay = ({ 
  storageUsage, 
  retentionDays, 
  isClearing, 
  storageType = "local",
  onClearStorage,
  onRefreshStorage
}: StorageUsageDisplayProps) => {
  // Get appropriate storage icon based on type
  const getStorageTypeIcon = () => {
    switch (storageType) {
      case 'nas':
        return <Database className="h-6 w-6 text-gray-500" />;
      case 's3':
      case 'dropbox':
      case 'google_drive':
      case 'onedrive':
      case 'azure_blob':
      case 'backblaze':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      default:
        return <HardDrive className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get storage type display name
  const getStorageTypeName = () => {
    switch (storageType) {
      case 'nas': return 'NAS Storage';
      case 's3': return 'S3 Compatible';
      case 'dropbox': return 'Dropbox';
      case 'google_drive': return 'Google Drive';
      case 'onedrive': return 'OneDrive';
      case 'azure_blob': return 'Azure Blob';
      case 'backblaze': return 'Backblaze B2';
      default: return 'Local Storage';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {storageUsage.usedSpaceFormatted} used of {storageUsage.totalSpaceFormatted}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {storageUsage.usedPercentage}%
            </div>
            {onRefreshStorage && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRefreshStorage} 
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <Progress value={storageUsage.usedPercentage} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-muted">
          <CardContent className="flex items-center space-x-4 p-4">
            {getStorageTypeIcon()}
            <div className="space-y-1">
              <p className="text-sm font-medium">Storage Type</p>
              <p className="text-base font-semibold">{getStorageTypeName()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted">
          <CardContent className="flex items-center space-x-4 p-4">
            <HardDrive className="h-6 w-6 text-gray-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Space</p>
              <p className="text-base font-semibold">{storageUsage.totalSpaceFormatted}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardContent className="flex items-center space-x-4 p-4">
            <Clock className="h-6 w-6 text-gray-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Retention Policy</p>
              <p className="text-base font-semibold">{retentionDays} days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        variant="destructive" 
        className="w-full" 
        onClick={onClearStorage}
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
    </div>
  );
};

export default StorageUsageDisplay;
