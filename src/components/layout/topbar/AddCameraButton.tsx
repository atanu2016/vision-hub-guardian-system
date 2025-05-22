
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AddCameraModal from "@/components/cameras/AddCameraModal";
import { CameraUIProps } from "@/utils/cameraPropertyMapper";

interface AddCameraButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddCamera: (camera: Omit<CameraUIProps, "id" | "lastSeen">) => Promise<any>;
  existingGroups: string[];
}

const AddCameraButton = ({ 
  isOpen, 
  setIsOpen, 
  onAddCamera, 
  existingGroups 
}: AddCameraButtonProps) => {
  return (
    <>
      <Button 
        variant="outline" 
        className="flex"
        onClick={() => setIsOpen(true)}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Camera
      </Button>
      
      <AddCameraModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAdd={onAddCamera}
        existingGroups={existingGroups}
      />
    </>
  );
};

export default AddCameraButton;
