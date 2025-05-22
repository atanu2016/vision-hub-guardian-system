
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { CameraUIProps } from "@/utils/cameraPropertyMapper";
import CameraDetailsForm from "./modal/CameraDetailsForm";
import CameraModalTabs from "./modal/CameraModalTabs";
import { toast } from "sonner";
import { CameraConnectionType } from "@/types/camera";
import { useCameraAdapter } from "@/hooks/useCameraAdapter";

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (camera: Omit<CameraUIProps, "id" | "lastSeen">) => void;
  existingGroups?: string[];
}

const AddCameraModal = ({ isOpen, onClose, onAdd, existingGroups = [] }: AddCameraModalProps) => {
  const [connectionTab, setConnectionTab] = useState<string>("ip");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { adaptCameraParams } = useCameraAdapter();

  // Initialize form with default values
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isValid } } = useForm({
    defaultValues: {
      name: "",
      location: "",
      ipAddress: "",
      port: "80",
      username: "",
      password: "",
      rtmpUrl: "",
      hlsUrl: "",
      onvifPath: "/onvif/device_service",
      group: "Ungrouped",
      manufacturer: "",
      model: ""
    }
  });

  // Watch these form values so we can access them
  const values = watch();

  // Handle the connection tab change
  const handleConnectionTabChange = (tab: string) => {
    setConnectionTab(tab);
  };

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setValue(field, value);
  };

  // Submit handler
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Determine connection type from active tab
      const connectionType = connectionTab as CameraConnectionType;
      
      const newCamera: Omit<CameraUIProps, "id" | "lastSeen"> = {
        name: data.name,
        location: data.location || "Unknown",
        status: "offline",
        ipAddress: data.ipAddress || "",
        port: parseInt(data.port) || 80,
        username: data.username || undefined,
        password: data.password || undefined,
        connectionType: connectionType,
        rtmpUrl: connectionType === "rtmp" ? data.rtmpUrl : undefined,
        hlsUrl: connectionType === "hls" ? data.hlsUrl : undefined,
        onvifPath: connectionType === "onvif" ? data.onvifPath : undefined,
        recording: false,
        group: data.group || "Ungrouped",
        manufacturer: data.manufacturer || undefined,
        model: data.model || undefined,
        motionDetection: false
      };
      
      await onAdd(newCamera);
      
      // Close the modal and reset form
      reset();
      onClose();
      toast.success(`Added camera: ${data.name}`);
    } catch (error) {
      console.error("Error adding camera:", error);
      toast.error("Failed to add camera");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Camera</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic camera details form */}
          <CameraDetailsForm
            register={register}
            errors={errors}
            existingGroups={existingGroups}
          />
          
          {/* Connection settings tabs */}
          <CameraModalTabs
            connectionTab={connectionTab}
            onTabChange={handleConnectionTabChange}
            formValues={values}
            onChange={handleChange}
          />
          
          {/* Form actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Camera"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraModal;
