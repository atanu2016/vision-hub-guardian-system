
import { Camera } from "@/types/camera";

export interface CameraSettingsProps {
  camera: Camera;
  onSave: (updatedCamera: Camera) => void;
  userRole?: 'superadmin' | 'admin' | 'operator' | 'user';
}

export interface SettingsSectionProps {
  cameraData: Camera;
  handleChange: (field: keyof Camera, value: string | boolean | number | string[]) => void;
  userRole?: 'superadmin' | 'admin' | 'operator' | 'user';
  disabled?: boolean;
}
