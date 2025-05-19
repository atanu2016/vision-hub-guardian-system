
import { Permission } from "@/utils/permissionUtils";
import { UserRole } from "@/contexts/auth/types";

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  canManageRole: (targetRole: UserRole) => boolean;
  role: UserRole;
  currentRole: UserRole;
  authRole: UserRole;
  isLoading: boolean;
  error: string | null;
}
