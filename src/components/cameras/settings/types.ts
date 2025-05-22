
import { Camera } from "@/types/camera";
import { UserRole } from "@/utils/permissionUtils";
import { CameraUIProps } from "@/utils/cameraPropertyMapper";

export interface CameraSettingsProps {
  camera: Camera;
  onSave: (updatedCamera: Camera) => void;
  userRole?: UserRole;
}

export interface SettingsSectionProps {
  cameraData: CameraUIProps;
  handleChange: (field: keyof CameraUIProps, value: string | boolean | number | string[]) => void;
  userRole?: UserRole;
  disabled?: boolean;
}
