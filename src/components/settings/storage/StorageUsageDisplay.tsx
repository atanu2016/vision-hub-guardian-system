
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Trash2, Clock } from "lucide-react";

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
  onClearStorage: () => void;
}

const StorageUsageDisplay = ({ 
  storageUsage, 
  retentionDays, 
  isClearing, 
  onClearStorage 
}: StorageUsageDisplayProps) => {
  return (
    <div className="space-y-4">
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
              <p className="text-lg font-semibold">{retentionDays} days</p>
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
