import { UserRole } from "@/types/admin";

export const roleHierarchy: Record<UserRole, number> = {
  'user': 0,
  'operator': 1,
  'admin': 2,
  'superadmin': 3
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  // If no role, no permissions
  if (!userRole) return false;

  console.log(`[PERMISSION-UTILS] Checking permission: ${permission} for role: ${userRole}`);

  // CRITICAL FIX: Direct permission grants for operator role
  // This ensures operators always have access to recordings regardless of other logic
  if (userRole === 'operator') {
    // Expanded operator permissions with recordings explicitly included
    const operatorPermissions = [
      'view-footage:assigned',
      'view-footage:all',
      'view-cameras:assigned',
      'manage-profile-settings',
      'manage-mfa-enrollment',
      'view-profile',
      'view-dashboard',
      'manage-cameras:assigned'
    ];
    
    if (operatorPermissions.includes(permission)) {
      console.log(`[PERMISSION-UTILS] OPERATOR ROLE - Directly granting permission: ${permission}`);
      return true;
    }
    
    // Explicit hardcoded check specifically for recordings-related permissions for operators
    // This is a fail-safe to ensure operators can always access recordings
    if (permission === 'view-footage:assigned' || permission === 'view-footage:all') {
      console.log(`[PERMISSION-UTILS] OPERATOR ROLE - Force allowing critical permission: ${permission}`);
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
    
    // Footage permissions - explicitly check for operator role and above
    case 'view-footage:assigned':
      // Explicitly include operator role here
      return userRole === 'operator' || roleHierarchy[userRole] >= roleHierarchy['operator']; 
    case 'view-footage:all':
      return userRole === 'operator' || roleHierarchy[userRole] >= roleHierarchy['operator'];
    
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
      return roleHierarchy[userRole] >= roleHierarchy['superadmin'];
    
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

  // Add a final fallback for recordings permissions for operators
  // This ensures that if we somehow missed granting these permissions above,
  // operators will still have access to recordings
  if (userRole === 'operator' && 
      (permission === 'view-footage:assigned' || permission === 'view-footage:all')) {
    console.log(`[PERMISSION-UTILS] OPERATOR FALLBACK - Ensuring recordings access: ${permission}`);
    return true;
  }

  return false;
}

export function canManageRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  // Superadmins can manage all roles
  if (currentUserRole === 'superadmin') {
    return true;
  }

  // Admins can manage operators and users, but not other admins or superadmins
  if (currentUserRole === 'admin') {
    return targetRole === 'operator' || targetRole === 'user';
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
