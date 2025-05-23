
import { Permission, UserRole } from '@/utils/permissionUtils';

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => Promise<boolean> | boolean;
  canManageRole: (role: UserRole) => boolean;
  role: UserRole;
  currentRole: UserRole;
  authRole: UserRole;
  isLoading: boolean;
  error?: string | null;
}

// Adding the missing PermissionCache interface
export interface PermissionCache {
  [key: string]: {
    timestamp: number;
    result: boolean;
  };
}
