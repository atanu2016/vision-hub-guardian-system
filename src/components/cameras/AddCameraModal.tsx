
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCameraModal } from "./modal/useCameraModal";
import CameraDetailsForm from "./modal/CameraDetailsForm";
import CameraModalTabs from "./modal/CameraModalTabs";
import CameraGroupSelector from "./modal/CameraGroupSelector";
import CameraMetadataForm from "./modal/CameraMetadataForm";
import { Camera } from "@/types/camera";

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (camera: Omit<Camera, "id">) => void;
  existingGroups: string[];
}

const AddCameraModal = ({ isOpen, onClose, onAdd, existingGroups }: AddCameraModalProps) => {
  const { formValues, handlers } = useCameraModal({ isOpen, onClose, onAdd, existingGroups });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Camera</DialogTitle>
          <DialogDescription>
            Enter the details of the camera you want to add to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlers.handleSubmit} className="space-y-4">
          {/* Camera name and location */}
          <CameraDetailsForm 
            name={formValues.name}
            location={formValues.location}
            onChange={handlers.handleFieldChange}
          />
          
          {/* Connection type tabs */}
          <CameraModalTabs 
            connectionTab={formValues.connectionTab}
            onTabChange={handlers.handleTabChange}
            connectionType={formValues.connectionType}
            formValues={formValues}
            onChange={handlers.handleFieldChange}
          />
          
          {/* Camera group selection */}
          <CameraGroupSelector 
            group={formValues.group}
            existingGroups={existingGroups}
            newGroupName={formValues.newGroupName}
            onGroupChange={handlers.handleGroupChange}
            onNewGroupNameChange={(value) => handlers.setNewGroupName(value)}
          />
          
          {/* Optional camera metadata */}
          <CameraMetadataForm 
            model={formValues.model}
            manufacturer={formValues.manufacturer}
            onChange={handlers.handleFieldChange}
          />

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => {
              handlers.resetForm();
              onClose();
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={formValues.isVerifying}>
              {formValues.isVerifying ? "Verifying..." : "Add Camera"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraModal;
