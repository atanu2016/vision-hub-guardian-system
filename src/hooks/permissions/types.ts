
import { UserRole } from "@/contexts/auth/types";
import { Permission } from "@/utils/permissionUtils";

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  canManageRole: (role: UserRole) => boolean;
  role: UserRole;
  currentRole: UserRole;
  authRole: UserRole;
  isLoading?: boolean;  // Add this property to the interface
  error?: string | null;
}

// Add the missing PermissionCache type
export interface PermissionCache {
  [key: string]: {
    timestamp: number;
    result: boolean;
  };
}
