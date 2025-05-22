
import { Camera, GroupedCameras } from "@/types/camera";
import { UserRole } from "@/utils/permissionUtils";

export interface UserCameraAssignment {
  userId: string;
  userName: string;
  cameraIds: string[];
}

export interface CameraAssignmentState {
  loading: boolean;
  users: UserWithCameras[];
  cameras: Camera[];
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
  state: CameraAssignmentState;
  loadUsers: () => Promise<void>;
  loadCameras: () => Promise<void>;
  assignCameras: (userId: string, cameraIds: string[]) => Promise<boolean>;
  reset: () => void;
}
