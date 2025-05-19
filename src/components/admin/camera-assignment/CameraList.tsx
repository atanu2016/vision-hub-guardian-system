
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera } from "./types";

interface CameraListProps {
  cameras: Camera[];
  loading: boolean;
  saving: boolean;
  canAssignCameras: boolean;
  onToggle: (cameraId: string, checked: boolean) => void;
}

export default function CameraList({
  cameras,
  loading,
  saving,
  canAssignCameras,
  onToggle
}: CameraListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (cameras.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No cameras available to assign
      </div>
    );
  }

  return (
    <ScrollArea className="h-[60vh] sm:h-[40vh] pr-4">
      <div className="space-y-4">
        {cameras.map((camera) => (
          <div key={camera.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`camera-${camera.id}`}
              checked={camera.assigned}
              onCheckedChange={(checked) => 
                onToggle(camera.id, checked === true)
              }
              disabled={!canAssignCameras || saving}
            />
            <label 
              htmlFor={`camera-${camera.id}`} 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {camera.name} - {camera.location}
            </label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
