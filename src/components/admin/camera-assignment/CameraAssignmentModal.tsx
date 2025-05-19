
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';
import { useAssignCameras } from '@/hooks/camera-assignment';

interface CameraAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const CameraAssignmentModal = ({ isOpen, onClose, userId, userName }: CameraAssignmentModalProps) => {
  const { 
    cameras, 
    loading, 
    saving, 
    error, 
    handleCameraToggle, 
    handleSave 
  } = useAssignCameras(userId, isOpen);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    const success = await handleSave();
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Cameras to {userName}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-destructive">{error}</div>
          ) : cameras.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No cameras found in the system.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameras.map((camera) => (
                <div key={camera.id} className="flex items-start space-x-2 border p-3 rounded-md">
                  <Checkbox 
                    id={`camera-${camera.id}`}
                    checked={camera.assigned}
                    onCheckedChange={(checked) => handleCameraToggle(camera.id, !!checked)}
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor={`camera-${camera.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {camera.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{camera.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || saving || !!error}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraAssignmentModal;
