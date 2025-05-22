
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2, Info } from "lucide-react";
import { useEffect, useState } from "react";

export interface StorageUsageProps {
  totalSpace: number;
  usedSpace: number;
  percentage: number;
  usedPercentage: number;
  usedSpaceFormatted: string;
  totalSpaceFormatted: string;
}

interface StorageUsageDisplayProps {
  storageUsage: StorageUsageProps;
  retentionDays: number;
  isClearing: boolean;
  onClearStorage: () => Promise<void>;
}

const StorageUsageDisplay = ({ 
  storageUsage, 
  retentionDays, 
  isClearing,
  onClearStorage 
}: StorageUsageDisplayProps) => {
  const [progress, setProgress] = useState(0);
  
  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(storageUsage.percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [storageUsage.percentage]);

  // Color classes based on usage percentage
  const getUsageColorClass = (percentage: number) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Used Storage</span>
            <span>{storageUsage.usedSpaceFormatted} of {storageUsage.totalSpaceFormatted} ({storageUsage.percentage}%)</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
            aria-label="Storage usage" 
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Info size={16} />
            <span>Recordings are automatically deleted after {retentionDays} days.</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearStorage} 
            disabled={isClearing || storageUsage.usedSpace === 0}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            {isClearing ? "Clearing..." : "Clear All Recordings"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StorageUsageDisplay;
