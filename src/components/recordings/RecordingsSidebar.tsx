import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, StorageInfo } from "@/hooks/useRecordings";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CalendarX } from "lucide-react";

interface RecordingsSidebarProps {
  cameras: Camera[];
  selectedCamera: string;
  setSelectedCamera: (camera: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  storageUsed: StorageInfo;
  dateFilter?: Date | null;
  onClearDateFilter?: () => void;
}

export default function RecordingsSidebar({
  cameras,
  selectedCamera,
  setSelectedCamera,
  selectedType,
  setSelectedType,
  storageUsed,
  dateFilter,
  onClearDateFilter,
}: RecordingsSidebarProps) {
  const recordingTypes = [
    { id: "all", name: "All Types" },
    { id: "scheduled", name: "Scheduled" },
    { id: "manual", name: "Manual" },
    { id: "motion", name: "Motion" }
  ];

  const usedPercentage = (storageUsed.used / storageUsed.total) * 100;

  return (
    <div className="space-y-6">
      {/* Camera selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Cameras</CardTitle>
          <CardDescription>
            Filter recordings by camera
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-1">
          <div className="grid grid-cols-1 gap-1">
            <Button
              variant={selectedCamera === "all" ? "default" : "ghost"}
              className="justify-start font-normal"
              onClick={() => setSelectedCamera("all")}
            >
              All Cameras
            </Button>
            {cameras.map((camera) => (
              <Button
                key={camera.id}
                variant={selectedCamera === camera.name ? "default" : "ghost"}
                className="justify-start font-normal"
                onClick={() => setSelectedCamera(camera.name)}
              >
                {camera.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recording type selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recording Type</CardTitle>
          <CardDescription>
            Filter by recording trigger
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-1">
          <div className="grid grid-cols-1 gap-1">
            {recordingTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? "default" : "ghost"}
                className="justify-start font-normal"
                onClick={() => setSelectedType(type.id)}
              >
                {type.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Date filter display */}
      {dateFilter && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Date Filter</CardTitle>
            <CardDescription>
              Showing recordings from selected date
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{format(dateFilter, "MMMM d, yyyy")}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearDateFilter}
                className="h-8 px-2"
              >
                <CalendarX className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage usage card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Storage</CardTitle>
          <CardDescription>
            Recording storage usage
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span>{storageUsed.used.toFixed(1)} GB / {storageUsed.total} GB</span>
            </div>
            <Progress value={usedPercentage} className="h-2" />
          </div>
          <Separator className="my-4" />
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = "/settings/storage"}
          >
            Manage Storage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
