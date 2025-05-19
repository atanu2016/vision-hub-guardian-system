
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useCameraAssignment } from './useCameraAssignment';
import CameraList from './CameraList';
import PermissionAlert from './PermissionAlert';
import { CameraAssignmentModalProps } from './types';

export default function CameraAssignmentModal({ 
  isOpen, 
  userId, 
  userName, 
  onClose 
}: CameraAssignmentModalProps) {
  const {
    cameras,
    loading,
    saving,
    canAssignCameras,
    handleCameraToggle,
    handleSave
  } = useCameraAssignment(userId, isOpen);
  
  const onSave = async () => {
    const success = await handleSave();
    if (success) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Cameras: {userName}</DialogTitle>
          <DialogDescription>
            Select which cameras this user can access. These changes will take effect immediately.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <PermissionAlert hasPermission={canAssignCameras} />
          
          <CameraList
            cameras={cameras}
            loading={loading}
            saving={saving}
            canAssignCameras={canAssignCameras}
            onToggle={handleCameraToggle}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            disabled={!canAssignCameras || saving || loading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
