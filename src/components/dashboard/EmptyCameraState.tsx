
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon } from "lucide-react";

interface EmptyCameraStateProps {
  message: string;
  description?: string;
  showManageCamerasButton?: boolean;
}

const EmptyCameraState = ({
  message,
  description,
  showManageCamerasButton = false
}: EmptyCameraStateProps) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium">{message}</h3>
      {description && (
        <p className="text-muted-foreground mt-2">
          {description}
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
  );
};

export default EmptyCameraState;
