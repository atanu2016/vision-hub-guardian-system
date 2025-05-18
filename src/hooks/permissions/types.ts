
import { UserRole } from "@/contexts/auth/types";
import { Permission } from "@/utils/permissionUtils";

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  canManageRole: (role: UserRole) => boolean;
  role: UserRole;
  currentRole: UserRole;
  authRole: UserRole;
  error?: string | null;
}
