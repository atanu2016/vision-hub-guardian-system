
import { useFetchCameras } from './useFetchCameras';
import { useAdminPermission } from './useAdminPermission';
import { useCameraOperations } from './useCameraOperations';
import { UseCameraAssignmentReturn } from './types';

export function useAssignCameras(userId: string, isOpen: boolean): UseCameraAssignmentReturn {
  const { canAssignCameras } = useAdminPermission();
  const { cameras, setCameras, loading, error } = useFetchCameras(userId, isOpen);
  const { saving, handleCameraToggle, handleSave: baseSave } = useCameraOperations(userId, cameras, setCameras);

  // Create a wrapper for handleSave that includes the permission check
  const handleSave = async () => {
    return await baseSave(canAssignCameras);
  };

  return {
    cameras,
    loading,
    saving,
    canAssignCameras,
    error,
    handleCameraToggle,
    handleSave
  };
}
