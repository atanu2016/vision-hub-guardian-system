
import { Camera } from "@/types/camera";
import CameraGrid from "@/components/cameras/CameraGrid";
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon } from "lucide-react";

interface GroupedCameras {
  id: string;
  name: string;
  cameras: Camera[];
}

interface CameraTabContentProps {
  groupedCameras: GroupedCameras[];
  groupBy: "none" | "group" | "location";
  emptyCamerasMessage: string;
  emptyCamerasDescription?: string;
  showManageCamerasButton?: boolean;
}

const CameraTabContent = ({
  groupedCameras,
  groupBy,
  emptyCamerasMessage,
  emptyCamerasDescription,
  showManageCamerasButton = false
}: CameraTabContentProps) => {
  return (
    <>
      {groupedCameras.map(group => (
        <div key={group.id} className="mb-8">
          {groupBy !== "none" && <h3 className="text-xl font-semibold mb-4">{group.name}</h3>}
          <CameraGrid cameras={group.cameras} />
        </div>
      ))}
      
      {groupedCameras.length === 0 || 
       (groupedCameras.length === 1 && groupedCameras[0].cameras.length === 0) ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">{emptyCamerasMessage}</h3>
          {emptyCamerasDescription && (
            <p className="text-muted-foreground mt-2">
              {emptyCamerasDescription}
            </p>
          )}
          {showManageCamerasButton && (
            <Button 
              className="mt-4"
              onClick={() => window.location.href = "/cameras"}
            >
              <CameraIcon className="mr-2 h-4 w-4" />
              Manage Cameras
            </Button>
          )}
        </div>
      ) : null}
    </>
  );
};

export default CameraTabContent;
