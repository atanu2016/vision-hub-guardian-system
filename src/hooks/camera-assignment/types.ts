
import { Camera as AssignmentCamera } from '@/components/admin/camera-assignment/types';
import { GroupedCameras } from '@/types/camera';

export interface UseCameraAssignmentReturn {
  cameras: AssignmentCamera[];
  loading: boolean;
  saving: boolean;
  canAssignCameras: boolean;
  isAuthenticated: boolean;
  groupedCameras?: Record<string, AssignmentCamera[]>;
  getAvailableGroups?: () => string[];
  getCamerasByGroup?: (groupName: string) => AssignmentCamera[];
  error: string | null;
  handleCameraToggle: (cameraId: string, checked: boolean) => void;
  handleSave: () => Promise<boolean>;
  loadCamerasAndAssignments: () => Promise<void>;
}
