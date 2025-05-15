
import { Camera } from "@/types/camera";

export interface CameraSettingsProps {
  camera: Camera;
  onSave: (updatedCamera: Camera) => void;
}

export interface SettingsSectionProps {
  cameraData: Camera;
  handleChange: (field: keyof Camera, value: string | boolean | number) => void;
}
