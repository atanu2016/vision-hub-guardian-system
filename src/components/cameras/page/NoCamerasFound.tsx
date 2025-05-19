
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoCamerasFoundProps {
  camerasExist: boolean;
  onAddCamera: () => void;
}

const NoCamerasFound = ({ camerasExist, onAddCamera }: NoCamerasFoundProps) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium">No cameras found</h3>
      <p className="text-muted-foreground mt-2">
        {camerasExist 
          ? "Try adjusting your search or add a new camera" 
          : "Add a camera to get started"}
      </p>
      <Button 
        className="mt-4"
        onClick={onAddCamera}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Camera
      </Button>
    </div>
  );
};

export default NoCamerasFound;
