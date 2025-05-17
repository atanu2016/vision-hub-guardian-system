
import { UserRole } from "@/types/admin";

export const roleHierarchy: Record<UserRole, number> = {
  'user': 0,
  'monitoringOfficer': 1, // Same level as operator for permissions
  'operator': 1,
  'admin': 2,
  'superadmin': 3
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  // If no role, no permissions
  if (!userRole) return false;

  console.log(`[PERMISSION-UTILS] Checking permission: ${permission} for role: ${userRole}`);

  // OPERATOR ROLE - CRITICAL ACCESS GUARANTEE
  // This ensures operators always have access to recordings regardless of other logic
  if (userRole === 'operator') {
    // Explicit list of guaranteed operator permissions - CRITICAL for application functionality
    const guaranteedOperatorPermissions: Permission[] = [
      'view-footage:assigned',
      'view-footage:all',
      'view-cameras:assigned',
      'manage-profile-settings',
      'manage-mfa-enrollment',
      'view-profile',
      'view-dashboard',
      'manage-cameras:assigned'
    ];
    
    if (guaranteedOperatorPermissions.includes(permission)) {
      console.log(`[PERMISSION-UTILS] OPERATOR ROLE - Directly granting permission: ${permission}`);
      return true;
    }
  }

  // MONITORING OFFICER ROLE - NEW ROLE
  // This ensures monitoring officers have access to live view, recordings and profile
  if (userRole === 'monitoringOfficer') {
    const guaranteedMonitoringPermissions: Permission[] = [
      'view-footage:assigned',
      'view-footage:all',
      'view-cameras:assigned',
      'manage-profile-settings',
      'manage-mfa-enrollment',
      'view-profile'
    ];
    
    if (guaranteedMonitoringPermissions.includes(permission)) {
      console.log(`[PERMISSION-UTILS] MONITORING OFFICER ROLE - Directly granting permission: ${permission}`);
      return true;
    }
  }

  switch (permission) {
    // User level permissions - available to all roles
    case 'view-dashboard':
      return roleHierarchy[userRole] >= roleHierarchy['user'];
    case 'view-profile':
    case 'manage-mfa-enrollment':
    case 'manage-profile-settings':
      return roleHierarchy[userRole] >= roleHierarchy['user'];

    // Cameras view permissions - all users can view assigned cameras
    case 'view-cameras:assigned':
      return roleHierarchy[userRole] >= roleHierarchy['user'];
    case 'view-cameras:all':
      return roleHierarchy[userRole] >= roleHierarchy['admin'];
    
    // Footage permissions - CRITICAL: Always grant to operators and monitoring officers
    case 'view-footage:assigned':
      return userRole === 'operator' || userRole === 'monitoringOfficer' || roleHierarchy[userRole] >= roleHierarchy['operator'];
    case 'view-footage:all':
      return userRole === 'operator' || userRole === 'monitoringOfficer' || roleHierarchy[userRole] >= roleHierarchy['operator'];
    
    // User management permissions
    case 'manage-users:lower':
      return roleHierarchy[userRole] >= roleHierarchy['admin'];
    case 'manage-users:all':
    case 'assign-roles':
      return userRole === 'superadmin';
    
    // Camera assignment permissions
    case 'assign-cameras':
      return roleHierarchy[userRole] >= roleHierarchy['admin'];

    // Camera management
    case 'manage-cameras:assigned':
      return roleHierarchy[userRole] >= roleHierarchy['operator'];
    case 'manage-cameras:all':
      return roleHierarchy[userRole] >= roleHierarchy['admin'];
    
    // Storage and configuration
    case 'configure-storage':
    case 'configure-camera-settings':
      return roleHierarchy[userRole] >= roleHierarchy['admin'];
    
    // Policy and system settings
    case 'configure-global-policies':
    case 'manage-system':
      return userRole === 'superadmin';
    
    // Logs and audit access
    case 'access-logs':
    case 'access-audit-trails':
      return roleHierarchy[userRole] >= roleHierarchy['admin'];

    // Advanced admin features
    case 'system-migration':
    case 'manage-ssl-certificates':
    case 'manage-webhooks':
    case 'system-updates':
      return userRole === 'superadmin';

    default:
      return false;
  }
}

export function canManageRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  // Superadmins can manage all roles
  if (currentUserRole === 'superadmin') {
    return true;
  }

  // Admins can manage operators, monitoring officers and users, but not other admins or superadmins
  if (currentUserRole === 'admin') {
    return targetRole === 'operator' || targetRole === 'monitoringOfficer' || targetRole === 'user';
  }

  // Operators and users cannot manage roles
  return false;
}

export type Permission = 
  // Basic permissions
  | 'view-dashboard'
  | 'view-profile'
  | 'manage-mfa-enrollment'
  | 'manage-profile-settings'
  
  // Camera viewing permissions
  | 'view-cameras:assigned'
  | 'view-cameras:all'
  
  // Footage viewing permissions
  | 'view-footage:assigned'
  | 'view-footage:all'
  
  // User management permissions
  | 'manage-users:lower'
  | 'manage-users:all'
  | 'assign-roles'
  | 'assign-cameras'
  
  // Camera management
  | 'manage-cameras:assigned'
  | 'manage-cameras:all'
  
  // Configuration permissions
  | 'configure-storage'
  | 'configure-camera-settings'
  | 'configure-global-policies'
  
  // System permissions
  | 'manage-system'
  | 'access-logs'
  | 'access-audit-trails'
  | 'system-migration'
  | 'manage-ssl-certificates'
  | 'manage-webhooks'
  | 'system-updates';
