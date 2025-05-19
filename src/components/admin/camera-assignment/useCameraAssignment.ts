
import { useAssignCameras } from '@/hooks/camera-assignment';
import { UseCameraAssignmentReturn } from '@/hooks/camera-assignment/types';

export function useCameraAssignment(userId: string, isOpen: boolean): UseCameraAssignmentReturn {
  return useAssignCameras(userId, isOpen);
}
