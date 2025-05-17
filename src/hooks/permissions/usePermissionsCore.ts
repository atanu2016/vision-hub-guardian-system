
import { useMemo } from 'react';
import { hasPermission as checkPermission, canManageRole } from '@/utils/permissionUtils';
import { useRoleSubscription } from './useRoleSubscription';
import type { Permission } from '@/utils/permissionUtils';
import { useOperatorPermissions } from './useOperatorPermissions';
import type { UsePermissionsReturn } from './types';
import type { UserRole } from '@/types/admin';

/**
 * Core hook for checking permissions with optimized performance
 */
export function usePermissionsCore(): UsePermissionsReturn {
  // Get current user role from context
  const { role, authRole } = useRoleSubscription();
  
  // Get optimized operator permissions
  const { isOperatorFastPathEnabled } = useOperatorPermissions(role, authRole);
  
  // Define the permissions checking function
  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      // First check if we can use the fast path for critical operator permissions
      if (isOperatorFastPathEnabled(permission)) {
        return true;
      }
      
      // For all other cases, use the full permission check
      return checkPermission(role, permission);
    };
  }, [role, isOperatorFastPathEnabled]);

  // Add canManageRole function
  const canManageRoleFunc = (targetRole: UserRole): boolean => {
    return canManageRole(role, targetRole);
  };

  return {
    hasPermission,
    canManageRole: canManageRoleFunc,
    role,
    currentRole: role,
    authRole
  };
}
