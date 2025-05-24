
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { UseCameraModalProps, UseCameraModalReturn } from "./types/cameraModalTypes";
import { validateCameraForm } from "./utils/cameraValidation";
import { simulateCameraConnection } from "./utils/connectionTester";
import { mapFormValuesToCamera } from "./utils/cameraMapper";
import { useCameraForm } from "./hooks/useCameraForm";

export function useCameraModal({ isOpen, onClose, onAdd, existingGroups }: UseCameraModalProps): UseCameraModalReturn {
  const { toast } = useToast();
  const { formState, formActions } = useCameraForm();
  const hasResetRef = useRef(false);
  
  // Only reset when modal opens for the first time
  useEffect(() => {
    if (isOpen && !hasResetRef.current) {
      console.log("Modal opened - resetting form once");
      formActions.resetForm();
      hasResetRef.current = true;
    } else if (!isOpen) {
      // Reset the flag when modal closes
      hasResetRef.current = false;
    }
  }, [isOpen, formActions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with values:", formState);

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
      
      // Debug log all connection details
      console.log("Form submission details:", {
        name: formState.name,
        connectionType: formState.connectionType,
        ipAddress: formState.ipAddress,
        rtspUrl: formState.rtspUrl,
        rtmpUrl: formState.rtmpUrl,
        hlsUrl: formState.hlsUrl
      });
      
      // Map form values to camera object
      const newCamera = mapFormValuesToCamera(formState, finalGroup);
      console.log("Mapped camera object:", newCamera);
      
      onAdd(newCamera);
      toast({
        title: "Success",
        description: `${formState.name} has been added successfully`,
      });
      formActions.resetForm();
      onClose();
    } catch (error) {
      console.error("Camera connection error:", error);
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
