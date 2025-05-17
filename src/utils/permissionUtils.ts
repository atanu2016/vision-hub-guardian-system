
import { UserRole } from "@/contexts/auth/types";

export type Permission = 
  | 'view-profile'
  | 'edit-profile'
  | 'view-admin-panel'
  | 'manage-users:all'
  | 'manage-users:lower'
  | 'assign-roles'
  | 'view-logs'
  | 'view-system-stats'
  | 'view-cameras:all' 
  | 'view-cameras:assigned'
  | 'view-footage:all'
  | 'view-footage:assigned'
  | 'manage-cameras'
  | 'assign-cameras'
  | 'delete-footage'
  | 'access-settings'
  | 'backup-restore'
  | 'view-dashboard'
  | 'manage-profile-settings'
  | 'configure-camera-settings'
  | 'configure-storage'
  | 'configure-global-policies'
  | 'manage-system'
  | 'access-logs'
  | 'system-migration';

// Cache permissions in memory for faster lookups
const permissionCache = new Map<string, boolean>();
const cacheTimeout = 60000; // 1 minute cache timeout
const cacheTimestamps = new Map<string, number>();

// Define permissions for each role (moved outside of function for better performance)
const rolePermissions = {
  superadmin: [
    'view-profile', 'edit-profile', 'view-admin-panel', 'manage-users:all',
    'assign-roles', 'view-logs', 'view-system-stats', 'view-cameras:all',
    'view-footage:all', 'manage-cameras', 'assign-cameras', 'delete-footage',
    'access-settings', 'backup-restore', 'view-dashboard', 'manage-profile-settings',
    'configure-camera-settings', 'configure-storage', 'configure-global-policies',
    'manage-system', 'access-logs', 'system-migration'
  ],
  admin: [
    'view-profile', 'edit-profile', 'view-admin-panel', 'manage-users:lower',
    'view-logs', 'view-system-stats', 'view-cameras:all', 'view-footage:all',
    'manage-cameras', 'assign-cameras', 'delete-footage', 'access-settings',
    'view-dashboard', 'manage-profile-settings', 'configure-camera-settings',
    'configure-storage', 'configure-global-policies', 'manage-system', 'access-logs'
  ],
  observer: [
    'view-profile', 'edit-profile', 'view-cameras:assigned', 'view-footage:assigned',
    'manage-profile-settings'
  ],
  user: [
    'view-profile', 'edit-profile', 'manage-profile-settings'
  ]
};

// Map critical observer permissions for fast access path
const observerCriticalPermissions = new Set([
  'view-footage:assigned',
  'view-cameras:assigned'
]);

// Fast permission check with caching
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  // Generate cache key
  const cacheKey = `${role}:${permission}`;
  const now = Date.now();
  
  // Fast path for critical observer permissions
  if (role === 'observer' && observerCriticalPermissions.has(permission)) {
    return true;
  }
  
  // Check cache first
  if (permissionCache.has(cacheKey)) {
    const timestamp = cacheTimestamps.get(cacheKey) || 0;
    if (now - timestamp < cacheTimeout) {
      return permissionCache.get(cacheKey) || false;
    }
  }
  
  // Calculate permission value
  const hasPermission = rolePermissions[role]?.includes(permission) || false;
  
  // Update cache
  permissionCache.set(cacheKey, hasPermission);
  cacheTimestamps.set(cacheKey, now);
  
  return hasPermission;
};

// Role management hierarchical helper
export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  if (!managerRole || !targetRole) return false;

  // Role hierarchy - using a simple object for faster lookups
  const roleHierarchy: { [key in UserRole]: number } = {
    superadmin: 3,
    admin: 2,
    observer: 1,
    user: 0
  };

  // Return true if manager's role is higher in hierarchy
  return roleHierarchy[managerRole] > roleHierarchy[targetRole];
};

// Export optimized utility functions
export const clearPermissionCache = () => {
  permissionCache.clear();
  cacheTimestamps.clear();
};

