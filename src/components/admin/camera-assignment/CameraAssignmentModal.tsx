
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
import { AlertCircle, Camera } from 'lucide-react';

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
    error,
    handleCameraToggle,
    handleSave
  } = useCameraAssignment(userId, isOpen);
  
  const onSave = async () => {
    const success = await handleSave();
    if (success) {
      toast.success(`Camera access updated for ${userName}`);
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
          
          {error && (
            <div className="bg-destructive/15 text-destructive border border-destructive/50 p-3 rounded-md mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {cameras.length === 0 && !loading && !error && (
            <div className="text-center py-6 text-muted-foreground border rounded-md">
              <Camera className="mx-auto h-8 w-8 opacity-50 mb-2" />
              <p className="mb-2">No cameras available to assign</p>
              <p className="text-sm">Add cameras to the system first before assigning them to users.</p>
            </div>
          )}
          
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
            disabled={!canAssignCameras || saving || loading || cameras.length === 0}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
