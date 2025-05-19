
export interface Camera {
  id: string;
  name: string;
  location: string;
  assigned?: boolean;
}

export interface CameraAssignmentModalProps {
  isOpen: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
}
