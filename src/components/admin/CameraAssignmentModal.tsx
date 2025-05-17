
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Camera } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Camera as CameraType } from '@/types/camera';
import { assignCamerasToUser, getUserAssignedCameras } from '@/services/userManagement/cameraAssignmentService';

interface CameraAssignmentModalProps {
  isOpen: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
}

export default function CameraAssignmentModal({
  isOpen,
  userId,
  userName,
  onClose
}: CameraAssignmentModalProps) {
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [selectedCameraIds, setSelectedCameraIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all cameras and user assignments
  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get all cameras
      const { data: allCameras, error: camerasError } = await supabase
        .from('cameras')
        .select('*');

      if (camerasError) throw camerasError;

      // Get user's assigned cameras
      const assignedCameraIds = await getUserAssignedCameras(userId);
      
      setCameras(allCameras as CameraType[]);
      setSelectedCameraIds(assignedCameraIds);
    } catch (error) {
      console.error("Error loading camera assignment data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCamera = (cameraId: string) => {
    setSelectedCameraIds(prev => {
      if (prev.includes(cameraId)) {
        return prev.filter(id => id !== cameraId);
      } else {
        return [...prev, cameraId];
      }
    });
  };

  const handleSaveAssignments = async () => {
    setIsSaving(true);
    try {
      const success = await assignCamerasToUser(userId, selectedCameraIds);
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Cameras to {userName}</DialogTitle>
          <DialogDescription>
            Select which cameras this user should have access to view. Users can only view cameras assigned to them.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto">
            <div className="space-y-4">
              {cameras.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No cameras available to assign</p>
              ) : (
                cameras.map(camera => (
                  <div key={camera.id} className="flex items-center space-x-2 border rounded-md p-3">
                    <Checkbox 
                      id={`camera-${camera.id}`} 
                      checked={selectedCameraIds.includes(camera.id)}
                      onCheckedChange={() => handleToggleCamera(camera.id)}
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <Label htmlFor={`camera-${camera.id}`} className="flex-1">
                        <span className="font-medium">{camera.name}</span>
                        <span className="block text-xs text-muted-foreground">{camera.location}</span>
                      </Label>
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full mr-2 ${camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs text-muted-foreground">{camera.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveAssignments} disabled={isLoading || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
