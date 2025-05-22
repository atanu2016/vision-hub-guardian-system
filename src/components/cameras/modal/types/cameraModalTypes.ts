
import { Camera, CameraConnectionType } from "@/types/camera";

export interface CameraFormValues {
  name: string;
  location: string;
  ipAddress: string;
  port: string;
  username: string;
  password: string;
  group: string;
  newGroupName: string;
  model: string;
  manufacturer: string;
  connectionType: CameraConnectionType;
  rtmpUrl: string;
  rtspUrl: string; // Added rtspUrl
  hlsUrl: string;
  onvifPath: string;
  connectionTab: string;
  isVerifying: boolean;
}

export interface UseCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (camera: Omit<Camera, "id">) => void;
  existingGroups: string[];
}

export interface UseCameraModalReturn {
  formValues: CameraFormValues;
  handlers: {
    handleFieldChange: (field: string, value: string) => void;
    handleTabChange: (tab: string) => void;
    handleGroupChange: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    setNewGroupName: (value: string) => void;
    resetForm: () => void;
  };
}
