
import { Camera } from "@/types/camera";
import CameraGrid from "@/components/cameras/CameraGrid";

interface CameraGroupDisplayProps {
  id: string;
  name: string; 
  cameras: Camera[];
  showGroupTitle: boolean;
}

const CameraGroupDisplay = ({
  name,
  cameras,
  showGroupTitle
}: CameraGroupDisplayProps) => {
  return (
    <div className="mb-8">
      {showGroupTitle && <h3 className="text-xl font-semibold mb-4">{name}</h3>}
      <CameraGrid cameras={cameras} />
    </div>
  );
};

export default CameraGroupDisplay;
