
import { usePermissionsCore } from "./permissions/usePermissionsCore";
import type { UsePermissionsReturn } from "./permissions/types";

// This wrapper function helps prevent circular dependencies
export function usePermissions(): UsePermissionsReturn {
  // Use a try/catch to prevent breaking the app if there's an initialization order issue
  try {
    return usePermissionsCore();
  } catch (error) {
    // Return a fallback object with default permissions if called during initialization
    console.warn("[Permissions] Fallback permissions used during initialization:", error);
    return {
      hasPermission: () => true, // Be permissive during initialization errors
      canManageRole: () => false,
      role: "user",
      isLoading: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export type { UsePermissionsReturn };
export { canManageRole } from "@/utils/permissionUtils";
