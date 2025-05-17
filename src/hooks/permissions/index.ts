
import { usePermissionsCore } from "./usePermissionsCore";
import type { UsePermissionsReturn } from "./types";

export function usePermissions(): UsePermissionsReturn {
  return usePermissionsCore();
}

export type { UsePermissionsReturn };
