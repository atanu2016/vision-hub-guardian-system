
import { Camera } from "@/types/camera";
import CameraGrid from "@/components/cameras/CameraGrid";

interface CameraGroupsProps {
  groups: {
    id: string;
    name: string;
    cameras: Camera[];
  }[];
  onDeleteCamera: (cameraId: string) => Promise<void>;
}

const CameraGroups = ({ groups, onDeleteCamera }: CameraGroupsProps) => {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <CameraGrid
          key={group.id}
          cameras={group.cameras}
          title={group.name}
          onDeleteCamera={onDeleteCamera}
        />
      ))}
    </div>
  );
};

export default CameraGroups;
