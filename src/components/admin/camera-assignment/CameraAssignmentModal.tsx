
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useAssignCameras } from '@/hooks/camera-assignment';
import CameraList from './CameraList';
import { Camera as AssignmentCamera } from './types';
import { ModalHeader } from './ModalHeader';
import { ErrorAlerts } from './ErrorAlerts';
import { CameraGroupSelector } from './CameraGroupSelector';
import { SavingProgress } from './SavingProgress';
import { ModalActions } from './ModalActions';
import { useModalAuthentication } from './hooks/useModalAuthentication';
import { useModalActions } from './hooks/useModalActions';
import { AuthenticationCheck } from './modals/AuthenticationCheck';

interface CameraAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const CameraAssignmentModal = ({ isOpen, onClose, userId, userName }: CameraAssignmentModalProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('All Cameras');
  
  const { 
    cameras, 
    loading, 
    saving, 
    error,
    canAssignCameras,
    isAuthenticated: hookIsAuthenticated,
    handleCameraToggle, 
    handleSave,
    loadCamerasAndAssignments,
    getAvailableGroups,
    getCamerasByGroup
  } = useAssignCameras(userId, isOpen);
  
  const { isAuthenticated, authChecked } = useModalAuthentication(isOpen);
  
  const { 
    isRefreshing,
    isSaving,
    savingStep,
    savingProgress,
    savingComplete,
    handleClose,
    handleSubmit,
    handleRefresh
  } = useModalActions({
    onClose,
    handleSave,
    isAuthenticated: isAuthenticated && hookIsAuthenticated,
    canAssignCameras,
    loadCamerasAndAssignments
  });

  // Combined auth check from both component and hook
  const isTrulyAuthenticated = isAuthenticated && hookIsAuthenticated;

  // Get cameras for the currently selected group
  const filteredCameras: AssignmentCamera[] = selectedGroup === 'All Cameras' ? 
    cameras : 
    (getCamerasByGroup ? getCamerasByGroup(selectedGroup) : []);

  // Show loading state while checking auth
  if (!authChecked) {
    return <AuthenticationCheck isOpen={isOpen} onClose={handleClose} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <ModalHeader 
            userName={userName}
            isRefreshing={isRefreshing}
            loading={loading}
            isSaving={isSaving}
            isAuthenticated={isTrulyAuthenticated}
            onRefresh={handleRefresh}
          />
        </DialogHeader>
        
        <div className="py-4">
          <ErrorAlerts 
            isAuthenticated={isTrulyAuthenticated}
            canAssignCameras={canAssignCameras}
            error={error}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
          
          <CameraGroupSelector 
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            getAvailableGroups={getAvailableGroups}
            getCamerasByGroup={getCamerasByGroup}
            loading={loading}
            isSaving={isSaving}
            isAuthenticated={isTrulyAuthenticated}
          />
          
          {!isSaving ? (
            <CameraList 
              cameras={filteredCameras}
              loading={loading}
              saving={isSaving}
              canAssignCameras={canAssignCameras && isTrulyAuthenticated}
              onToggle={handleCameraToggle}
            />
          ) : (
            <SavingProgress 
              isSaving={isSaving}
              savingStep={savingStep}
              savingProgress={savingProgress}
              savingComplete={savingComplete}
            />
          )}
        </div>
        
        <ModalActions 
          onClose={handleClose}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          savingComplete={savingComplete}
          loading={loading}
          error={error}
          canAssignCameras={canAssignCameras}
          isAuthenticated={isTrulyAuthenticated}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CameraAssignmentModal;
