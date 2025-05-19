
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera } from './types';
import { useCameraOperations } from '@/hooks/camera-assignment/useCameraOperations';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getUserAssignedCameras } from '@/services/userManagement/cameraAssignment';
import { supabase } from '@/integrations/supabase/client';

interface CameraAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const CameraAssignmentModal = ({ isOpen, onClose, userId, userName }: CameraAssignmentModalProps) => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const { saving, handleCameraToggle, handleSave } = useCameraOperations(userId, cameras, setCameras);

  // Load all cameras and user's assigned cameras
  const loadCamerasAndAssignments = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Step 1: Get all cameras
      const { data: allCameras, error: camerasError } = await supabase
        .from('cameras')
        .select('id, name, location');
      
      if (camerasError) {
        console.error("Error fetching cameras:", camerasError);
        setLoadError("Failed to load cameras");
        return;
      }
      
      if (!allCameras || allCameras.length === 0) {
        setLoadError("No cameras found in system");
        setCameras([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Found ${allCameras.length} cameras in system`);
      
      // Step 2: Get user's assigned cameras
      try {
        const assignedCameraIds = await getUserAssignedCameras(userId);
        console.log(`User ${userId} has ${assignedCameraIds.length} assigned cameras`, assignedCameraIds);
        
        // Step 3: Mark cameras as assigned or not
        const formattedCameras: Camera[] = allCameras.map(camera => ({
          id: camera.id,
          name: camera.name,
          location: camera.location || 'Unknown',
          assigned: assignedCameraIds.includes(camera.id)
        }));
        
        setCameras(formattedCameras);
      } catch (assignmentError) {
        console.error("Error fetching camera assignments:", assignmentError);
        // Still show cameras without assignment data
        const formattedCameras: Camera[] = allCameras.map(camera => ({
          id: camera.id,
          name: camera.name,
          location: camera.location || 'Unknown',
          assigned: false
        }));
        setCameras(formattedCameras);
        toast.error("Could not load current assignments");
      }
    } catch (error) {
      console.error("Error in loadCamerasAndAssignments:", error);
      setLoadError("Failed to load camera data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when modal is opened
  useEffect(() => {
    if (isOpen && userId) {
      loadCamerasAndAssignments();
    }
  }, [isOpen, userId]);

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
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : loadError ? (
            <div className="text-center p-4 text-destructive">{loadError}</div>
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
            disabled={isLoading || saving || !!loadError}
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
