
import { Camera } from '@/components/admin/camera-assignment/types';

export interface UseCameraAssignmentReturn {
  cameras: Camera[];
  loading: boolean;
  saving: boolean;
  canAssignCameras: boolean;
  isAuthenticated: boolean;
  error: string | null;
  handleCameraToggle: (cameraId: string, checked: boolean) => void;
  handleSave: () => Promise<boolean>;
  loadCamerasAndAssignments: () => Promise<void>;
}
