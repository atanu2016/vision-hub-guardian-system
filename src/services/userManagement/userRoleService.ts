
/**
 * @deprecated Use services from roleServices folder instead
 * This file is kept for backward compatibility and will be removed in the future
 */

// Re-export all functionality from the refactored files
import { updateUserRole, hasRole, invalidateRoleCache } from './roleServices';

export { updateUserRole, hasRole, invalidateRoleCache };
