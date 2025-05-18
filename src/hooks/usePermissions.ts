
import { usePermissionsCore } from "./permissions/usePermissionsCore";
import type { UsePermissionsReturn } from "./permissions/types";

// This wrapper function helps prevent circular dependencies and React hooks errors
export function usePermissions(): UsePermissionsReturn {
  // Create a safe wrapper that doesn't break the React rules of hooks
  try {
    return usePermissionsCore();
  } catch (error) {
    // Return a fallback object with default permissions if called during initialization
    console.warn("[Permissions] Fallback permissions used:", error);
    return {
      hasPermission: () => true, // Be permissive during initialization errors
      canManageRole: () => false,
      role: "user",
      currentRole: "user", 
      authRole: "user",
      isLoading: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export type { UsePermissionsReturn };
export { canManageRole } from "@/utils/permissionUtils";
