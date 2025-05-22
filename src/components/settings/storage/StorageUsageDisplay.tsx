
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface StorageUsageDisplayProps {
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
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
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const formatStorage = (sizeInGB: number) => {
    if (sizeInGB < 1) {
      return `${Math.round(sizeInGB * 1024)} MB`;
    } else if (sizeInGB >= 1000) {
      return `${(sizeInGB / 1000).toFixed(1)} TB`;
    } else {
      return `${sizeInGB.toFixed(1)} GB`;
    }
  };

  const handleClearConfirm = async () => {
    await onClearStorage();
    setDialogOpen(false);
  };

  // Choose a color based on usage percentage
  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return "bg-red-500";
    if (percentage > 70) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Storage Used</span>
          <span className="font-medium">
            {formatStorage(storageUsage.used)} of {formatStorage(storageUsage.total)}
          </span>
        </div>
        <Progress 
          value={storageUsage.percentage} 
          className="h-2"
          indicatorClassName={getProgressColor(storageUsage.percentage)}
        />
        <div className="text-xs text-muted-foreground">
          Recordings retention period: {retentionDays} days
        </div>
      </div>

      {storageUsage.percentage > 90 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Storage Almost Full</AlertTitle>
          <AlertDescription>
            Your storage is almost full. Consider clearing old recordings or increasing your storage capacity.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              disabled={storageUsage.used === 0 || isClearing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearing ? "Clearing..." : "Clear Storage"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Recording Storage</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all stored recordings. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleClearConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear Storage
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default StorageUsageDisplay;
