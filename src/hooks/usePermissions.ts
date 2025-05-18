
import { usePermissionsCore } from "./permissions/usePermissionsCore";
import type { UsePermissionsReturn } from "./permissions/types";

export function usePermissions(): UsePermissionsReturn {
  return usePermissionsCore();
}

export type { UsePermissionsReturn };
export { canManageRole } from "@/utils/permissionUtils";
