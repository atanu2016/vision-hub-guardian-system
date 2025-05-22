
import { Camera } from "@/types/camera";
import { UserRole } from "@/utils/permissionUtils";

export interface CameraSettingsProps {
  camera: Camera;
  onSave: (updatedCamera: Camera) => void;
  userRole?: UserRole;
}

export interface SettingsSectionProps {
  cameraData: Camera;
  handleChange: (field: keyof Camera, value: string | boolean | number | string[]) => void;
  userRole?: UserRole;
  disabled?: boolean;
}
