
import { usePermissionsCore } from "./usePermissionsCore";
import { canManageRole } from "@/utils/permissionUtils";
import type { UsePermissionsReturn } from "./types";

export function usePermissions(): UsePermissionsReturn {
  return usePermissionsCore();
}

export { canManageRole };
export type { UsePermissionsReturn };
