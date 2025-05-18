
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
import { Camera as CameraType, CameraStatus } from '@/types/camera';
import { assignCamerasToUser, getUserAssignedCameras } from '@/services/userManagement/cameraAssignmentService';
import { toast } from 'sonner';

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
      console.log("Loading camera assignments for user:", userId);
      
      // Get all cameras
      const { data: allCameras, error: camerasError } = await supabase
        .from('cameras')
        .select('*');

      if (camerasError) {
        console.error("Error fetching cameras:", camerasError);
        throw camerasError;
      }

      // Map database fields to Camera type
      const typedCameras: CameraType[] = allCameras ? allCameras.map(cam => ({
        id: cam.id,
        name: cam.name,
        location: cam.location,
        ipAddress: cam.ipaddress,
        port: cam.port,
        username: cam.username,
        password: cam.password,
        rtmpUrl: cam.rtmpurl,
        connectionType: cam.connectiontype as CameraType['connectionType'],
        onvifPath: cam.onvifpath,
        manufacturer: cam.manufacturer,
        model: cam.model,
        status: (cam.status || 'offline') as CameraStatus,
        lastSeen: cam.lastseen,
        motionDetection: cam.motiondetection || false,
        recording: cam.recording || false,
        thumbnail: cam.thumbnail,
        group: cam.group
      })) : [];

      // Get user's assigned cameras
      const assignedCameraIds = await getUserAssignedCameras(userId);
      console.log("Assigned camera IDs:", assignedCameraIds);
      
      setCameras(typedCameras);
      setSelectedCameraIds(assignedCameraIds);
    } catch (error) {
      console.error("Error loading camera assignment data:", error);
      toast.error("Failed to load cameras");
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
    if (!userId) {
      toast.error("No user selected");
      return;
    }
    
    setIsSaving(true);
    try {
      console.log("Saving camera assignments for user:", userId);
      console.log("Selected camera IDs:", selectedCameraIds);
      
      await assignCamerasToUser(userId, selectedCameraIds);
      toast.success(`Camera assignments updated for ${userName}`);
      onClose();
    } catch (error) {
      console.error("Error saving camera assignments:", error);
      toast.error("Failed to update camera assignments");
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
