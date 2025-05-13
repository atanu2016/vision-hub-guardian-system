
import { Camera } from "@/types/camera";
import CameraCard from "./CameraCard";

interface CameraGridProps {
  cameras: Camera[];
  title?: string;
}

const CameraGrid = ({ cameras, title }: CameraGridProps) => {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cameras.map((camera) => (
          <CameraCard key={camera.id} camera={camera} />
        ))}
      </div>
    </div>
  );
};

export default CameraGrid;
