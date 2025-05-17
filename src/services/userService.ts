
// Import and re-export user management services
import { fetchAllUsers } from './userManagement/userFetchService';
import { updateUserRole, hasRole } from './userManagement/roleServices';
import { checkMigrationAccess, ensureUserIsAdmin } from './userManagement/adminAccessService';
import { deleteUser } from './userManagement/userDeleteService';
import {
  toggleMfaRequirement,
  revokeMfaEnrollment,
  updatePersonalMfaSetting,
  isMfaRequired,
  isMfaEnrolled,
  getUserMfaStatus,
  verifyTotpCode,
  generateTotpSecret,
  generateQrCodeUrl
} from './userManagement/mfa';

// Consolidated exports
export {
  // User management
  fetchAllUsers,
  updateUserRole,
  hasRole,
  deleteUser,
  
  // Admin access
  checkMigrationAccess,
  ensureUserIsAdmin,
  
  // MFA functionality
  toggleMfaRequirement,
  revokeMfaEnrollment,
  updatePersonalMfaSetting,
  isMfaRequired,
  isMfaEnrolled,
  getUserMfaStatus,
  verifyTotpCode,
  generateTotpSecret,
  generateQrCodeUrl
};
