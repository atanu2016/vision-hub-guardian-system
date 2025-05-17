
import { UserRole } from "@/types/admin";
import { Permission } from "@/utils/permissionUtils";

export interface PermissionCache {
  [key: string]: {
    timestamp: number;
    result: boolean;
  }
}

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  canManageRole: (targetRole: UserRole) => boolean;
  currentRole: UserRole;
}
