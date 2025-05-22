
import { Skeleton } from "@/components/ui/skeleton";
import CameraCard from "@/components/cameras/CameraCard";
import { Camera } from "@/types/camera";

interface CameraTabContentProps {
  loading: boolean;
  cameras: Camera[];
}

const CameraTabContent = ({ loading, cameras }: CameraTabContentProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
    );
  }

  if (cameras.length === 0) {
    return <div className="col-span-3 text-center">No cameras found.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cameras.map((camera) => (
        <CameraCard key={camera.id} camera={camera} />
      ))}
    </div>
  );
};

export default CameraTabContent;
