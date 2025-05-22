
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { UseCameraModalProps, UseCameraModalReturn } from "./types/cameraModalTypes";
import { validateCameraForm } from "./utils/cameraValidation";
import { simulateCameraConnection } from "./utils/connectionTester";
import { mapFormValuesToCamera } from "./utils/cameraMapper";
import { useCameraForm } from "./hooks/useCameraForm";

export function useCameraModal({ isOpen, onClose, onAdd, existingGroups }: UseCameraModalProps): UseCameraModalReturn {
  const { toast } = useToast();
  const { formState, formActions } = useCameraForm();
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      formActions.resetForm();
    }
  }, [isOpen, formActions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const { isValid, errorMessage } = validateCameraForm(formState);
    if (!isValid) {
      toast({
        title: "Error",
        description: errorMessage || "Please fix the form errors",
        variant: "destructive"
      });
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
      
      // Log the form values especially related to RTSP
      console.log("Form values before mapping:", {
        connectionType: formState.connectionType,
        rtspUrl: formState.rtspUrl,
        rtmpUrl: formState.rtmpUrl
      });
      
      // Map form values to camera object
      const newCamera = mapFormValuesToCamera(formState, finalGroup);
      
      // Log the mapped camera to check RTSP values
      console.log("Mapped camera object:", {
        connectionType: newCamera.connectionType,
        rtspUrl: newCamera.rtspUrl,
        rtmpUrl: newCamera.rtmpUrl
      });

      onAdd(newCamera);
      toast({
        title: "Success",
        description: `${formState.name} has been added to ${finalGroup}`,
      });
      formActions.resetForm();
      onClose();
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not connect to camera. Check credentials and try again.",
        variant: "destructive"
      });
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
