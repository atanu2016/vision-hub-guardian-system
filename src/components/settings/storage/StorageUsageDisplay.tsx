
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Trash2, Clock, RefreshCw, Cloud, Database, AlertTriangle } from "lucide-react";

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

  // Get color based on usage percentage
  const getUsageColor = () => {
    if (storageUsage.usedPercentage >= 95) return 'bg-red-600';
    if (storageUsage.usedPercentage >= 90) return 'bg-red-500';
    if (storageUsage.usedPercentage >= 80) return 'bg-orange-500';
    if (storageUsage.usedPercentage >= 60) return 'bg-yellow-500';
    if (storageUsage.usedPercentage >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Get text color based on usage percentage
  const getUsageTextColor = () => {
    if (storageUsage.usedPercentage >= 95) return 'text-red-700';
    if (storageUsage.usedPercentage >= 90) return 'text-red-600';
    if (storageUsage.usedPercentage >= 80) return 'text-orange-600';
    if (storageUsage.usedPercentage >= 60) return 'text-yellow-600';
    if (storageUsage.usedPercentage >= 40) return 'text-blue-600';
    return 'text-green-600';
  };

  // Get warning message
  const getWarningMessage = () => {
    if (storageUsage.usedPercentage >= 95) {
      return "🚨 CRITICAL: Storage almost full! Clear recordings immediately!";
    }
    if (storageUsage.usedPercentage >= 90) {
      return "⚠️ URGENT: Storage critically full! Clear old recordings now.";
    }
    if (storageUsage.usedPercentage >= 80) {
      return "⚠️ WARNING: Storage usage high. Consider clearing old recordings soon.";
    }
    return null;
  };

  const availableSpace = storageUsage.totalSpace - storageUsage.usedSpace;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {storageUsage.usedSpaceFormatted} used of {storageUsage.totalSpaceFormatted}
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-sm font-medium ${getUsageTextColor()}`}>
              {storageUsage.usedPercentage}%
            </div>
            {onRefreshStorage && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRefreshStorage} 
                className="h-6 w-6 p-0"
                title="Refresh storage data"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Color-coded progress bar */}
        <div className="relative">
          <Progress value={storageUsage.usedPercentage} className="h-3" />
          <div 
            className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getUsageColor()}`}
            style={{ width: `${Math.min(storageUsage.usedPercentage, 100)}%` }}
          />
        </div>
        
        {/* Warning message */}
        {getWarningMessage() && (
          <div className={`text-xs font-medium flex items-center gap-2 p-2 rounded ${
            storageUsage.usedPercentage >= 95 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
            storageUsage.usedPercentage >= 90 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
            'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
          }`}>
            <AlertTriangle className="h-4 w-4" />
            {getWarningMessage()}
          </div>
        )}
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
            <HardDrive className={`h-6 w-6 ${availableSpace < (storageUsage.totalSpace * 0.1) ? 'text-red-500' : 'text-green-500'}`} />
            <div className="space-y-1">
              <p className="text-sm font-medium">Available Space</p>
              <p className={`text-base font-semibold ${availableSpace < (storageUsage.totalSpace * 0.1) ? 'text-red-600' : 'text-green-600'}`}>
                {formatStorageSize(availableSpace)}
              </p>
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

// Helper function to format storage size
const formatStorageSize = (sizeInGB: number): string => {
  if (sizeInGB >= 1024) {
    return `${(sizeInGB / 1024).toFixed(1)} TB`;
  } else if (sizeInGB >= 1) {
    return `${sizeInGB.toFixed(1)} GB`;
  } else {
    return `${(sizeInGB * 1024).toFixed(0)} MB`;
  }
};

export default StorageUsageDisplay;
