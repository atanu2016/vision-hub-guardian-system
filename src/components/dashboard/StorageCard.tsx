
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HardDrive } from "lucide-react";

interface StorageCardProps {
  storageUsed: string;
  storageTotal: string;
  storagePercentage: number;
  uptimeHours: number;
}

const StorageCard = ({ 
  storageUsed, 
  storageTotal, 
  storagePercentage, 
  uptimeHours 
}: StorageCardProps) => {
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
          <HardDrive className="h-4 w-4" /> Details
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              {storageUsed} used of {storageTotal}
            </div>
            <div className="text-sm font-medium">{storagePercentage}%</div>
          </div>
          <Progress value={storagePercentage} className="h-2" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Est. Recording Time Left</span>
            <span className="text-2xl font-bold">14 Days</span>
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
