
import { Camera } from '@/components/admin/camera-assignment/types';
import { GroupedCameras } from '@/types/camera';

export interface UseCameraAssignmentReturn {
  cameras: Camera[];
  loading: boolean;
  saving: boolean;
  canAssignCameras: boolean;
  isAuthenticated: boolean;
  groupedCameras?: GroupedCameras;
  getAvailableGroups?: () => string[];
  getCamerasByGroup?: (groupName: string) => Camera[];
  error: string | null;
  handleCameraToggle: (cameraId: string, checked: boolean) => void;
  handleSave: () => Promise<boolean>;
  loadCamerasAndAssignments: () => Promise<void>;
}
