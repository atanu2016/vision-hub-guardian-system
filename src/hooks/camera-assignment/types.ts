
import { Camera, GroupedCameras } from "@/types/camera";
import { UserRole } from "@/utils/permissionUtils";
import { Camera as AssignmentCamera } from "@/components/admin/camera-assignment/types";

export interface UserCameraAssignment {
  userId: string;
  userName: string;
  cameraIds: string[];
}

export interface CameraAssignmentState {
  loading: boolean;
  users: UserWithCameras[];
  cameras: AssignmentCamera[]; // Updated to use AssignmentCamera
  saving: boolean;
  error: string | null;
}

export interface UserWithCameras {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cameraIds: string[];
}

export interface UseCameraAssignmentReturn {
  cameras: AssignmentCamera[]; // Updated to use AssignmentCamera
  loading: boolean;
  saving: boolean;
  canAssignCameras: boolean;
  isAuthenticated: boolean;
  groupedCameras: GroupedCameras[];
  getAvailableGroups: () => string[];
  getCamerasByGroup: (group: string) => AssignmentCamera[]; // Updated to use AssignmentCamera
  error: string | null;
  handleCameraToggle: (cameraId: string) => void;
  handleSave: () => Promise<boolean>;
  loadCamerasAndAssignments: () => Promise<void>;
  state?: CameraAssignmentState;
  loadUsers?: () => Promise<void>;
  loadCameras?: () => Promise<void>;
  assignCameras?: (userId: string, cameraIds: string[]) => Promise<boolean>;
  reset?: () => void;
}
