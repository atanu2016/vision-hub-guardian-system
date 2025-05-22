
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { UseCameraModalProps, UseCameraModalReturn } from "./types/cameraModalTypes";
import { validateCameraForm } from "./utils/cameraValidation";
import { simulateCameraConnection } from "./utils/connectionTester";
import { mapFormValuesToCamera } from "./utils/cameraMapper";
import { useCameraForm } from "./hooks/useCameraForm";

export function useCameraModal({ isOpen, onClose, onAdd }: UseCameraModalProps): UseCameraModalReturn {
  const { toast } = useToast();
  const { formState, formActions } = useCameraForm();
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      formActions.resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const { isValid, errorMessage } = validateCameraForm(formState);
    if (!isValid) {
      toast.error(errorMessage || "Please fix the form errors");
      return;
    }

    // Process group information
    let finalGroup = formState.group;
    if (formState.group === "new" && formState.newGroupName) {
      finalGroup = formState.newGroupName.trim();
    }

    // Verify connection
    formActions.setIsVerifying(true);
    
    try {
      await simulateCameraConnection();
      
      // Map form values to camera object
      const newCamera = mapFormValuesToCamera(formState, finalGroup);

      onAdd(newCamera);
      toast.success(`${formState.name} has been added to ${finalGroup}`);
      formActions.resetForm();
      onClose();
    } catch (error) {
      toast.error("Could not connect to camera. Check credentials and try again.");
    } finally {
      formActions.setIsVerifying(false);
    }
  };

  return {
    formValues: formState,
    handlers: {
      handleFieldChange: formActions.handleFieldChange,
      handleTabChange: formActions.handleTabChange,
      handleGroupChange: formActions.handleGroupChange,
      handleSubmit,
      setNewGroupName: formActions.setNewGroupName,
      resetForm: formActions.resetForm
    }
  };
}
