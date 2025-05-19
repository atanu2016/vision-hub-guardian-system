
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
import { Loader2, Camera, AlertCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Camera as CameraType, CameraStatus } from '@/types/camera';
import { assignCamerasToUser, getUserAssignedCameras } from '@/services/userManagement/cameraAssignmentService';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/permissions';

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
  const [error, setError] = useState<string | null>(null);
  const { role } = usePermissions();
  
  // Direct check for admin status - avoid RLS recursion
  const [canAssignCameras, setCanAssignCameras] = useState(false);

  // Check admin status directly
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Check via session email first (fastest method)
        const { data: sessionData } = await supabase.auth.getSession();
        const userEmail = sessionData?.session?.user?.email?.toLowerCase();
        
        if (userEmail === 'admin@home.local' || userEmail === 'superadmin@home.local') {
          setCanAssignCameras(true);
          return;
        }
        
        // Check via profiles table
        if (sessionData?.session?.user?.id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', sessionData.session.user.id)
            .maybeSingle();
            
          if (profileData?.is_admin) {
            setCanAssignCameras(true);
            return;
          }
        }
        
        // Fallback to role check
        if (role === 'admin' || role === 'superadmin') {
          setCanAssignCameras(true);
          return;
        }
        
        setCanAssignCameras(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        // Fall back to role-based check
        setCanAssignCameras(role === 'superadmin' || role === 'admin');
      }
    }
    
    checkAdminStatus();
  }, [role, isOpen]);

  // Fetch all cameras and user assignments
  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Loading camera assignments for user:", userId);
      console.log("Current user role:", role);
      
      // Get all cameras
      const { data: allCameras, error: camerasError } = await supabase
        .from('cameras')
        .select('*');

      if (camerasError) {
        console.error("Error fetching cameras:", camerasError);
        setError("Failed to load cameras. Please try again.");
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

      // Get user's assigned cameras - direct query to avoid RLS issues
      try {
        const { data: assignedCameras, error: assignmentError } = await supabase
          .from('user_camera_access')
          .select('camera_id')
          .eq('user_id', userId);
          
        if (assignmentError) {
          console.error("Error fetching camera assignments:", assignmentError);
          setError("Failed to load camera assignments. Please try again.");
          setSelectedCameraIds([]);
        } else {
          const assignedCameraIds = assignedCameras?.map(a => a.camera_id) || [];
          console.log("Assigned camera IDs:", assignedCameraIds);
          setSelectedCameraIds(assignedCameraIds);
        }
      } catch (error) {
        console.error("Error processing camera assignments:", error);
        setSelectedCameraIds([]);
      }
      
      setCameras(typedCameras);
    } catch (error: any) {
      console.error("Error loading camera assignment data:", error);
      setError(error?.message || "Failed to load cameras. Please try again.");
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
    
    if (!canAssignCameras) {
      toast.error("You don't have permission to assign cameras");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      console.log("Saving camera assignments for user:", userId);
      console.log("Selected camera IDs:", selectedCameraIds);
      
      // Direct database operations to avoid RLS issues
      // First remove all existing assignments
      const { error: deleteError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("Error removing existing assignments:", deleteError);
        throw deleteError;
      }
      
      // Then add the new assignments
      if (selectedCameraIds.length > 0) {
        const assignmentsToInsert = selectedCameraIds.map(cameraId => ({
          user_id: userId,
          camera_id: cameraId,
          created_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('user_camera_access')
          .insert(assignmentsToInsert);
          
        if (insertError) {
          console.error("Error adding camera assignments:", insertError);
          throw insertError;
        }
      }
      
      toast.success(`Camera assignments updated for ${userName}`);
      onClose();
    } catch (error: any) {
      console.error("Error saving camera assignments:", error);
      setError(error?.message || "Failed to update camera assignments. Please try again.");
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

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
          <Button 
            onClick={handleSaveAssignments} 
            disabled={isLoading || isSaving || !canAssignCameras}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
