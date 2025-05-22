
import { Camera } from "@/types/camera";
import EmptyCameraState from "./EmptyCameraState";
import CameraGroupDisplay from "./CameraGroupDisplay";

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
  const isEmpty = 
    groupedCameras.length === 0 || 
    (groupedCameras.length === 1 && groupedCameras[0].cameras.length === 0);
  
  if (isEmpty) {
    return (
      <EmptyCameraState
        message={emptyCamerasMessage}
        description={emptyCamerasDescription}
        showManageCamerasButton={showManageCamerasButton}
      />
    );
  }
  
  return (
    <>
      {groupedCameras.map(group => (
        <CameraGroupDisplay
          key={group.id}
          id={group.id}
          name={group.name}
          cameras={group.cameras}
          showGroupTitle={groupBy !== "none"}
        />
      ))}
    </>
  );
};

export default CameraTabContent;
