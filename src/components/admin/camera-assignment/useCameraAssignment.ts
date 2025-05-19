
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Camera } from './types';
import { toast } from 'sonner';

export function useCameraAssignment(userId: string, isOpen: boolean) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canAssignCameras, setCanAssignCameras] = useState(false);
  
  // Check if current user can assign cameras (admin check)
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get the current user session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session) {
          console.log("No active session found");
          setCanAssignCameras(false);
          return;
        }
        
        const userEmail = sessionData.session.user?.email?.toLowerCase();
        
        // Special case for admin emails first - fastest path
        if (userEmail === 'admin@home.local' || userEmail === 'superadmin@home.local') {
          console.log("Admin email detected, granting camera assignment permission");
          setCanAssignCameras(true);
          return;
        }
        
        // Use the safe function to check admin status without recursion
        const { data: adminCheckData, error: adminCheckError } = await supabase
          .rpc('check_admin_status_safe');
          
        if (adminCheckError) {
          console.error("Error checking admin status:", adminCheckError);
          
          // Fallback to profile check
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', sessionData.session.user?.id)
            .maybeSingle();
            
          if (profileData?.is_admin) {
            console.log("Admin flag detected in profile, granting camera assignment permission");
            setCanAssignCameras(true);
            return;
          }
        } else if (adminCheckData) {
          console.log("Admin check successful, granting camera assignment permission");
          setCanAssignCameras(true);
          return;
        }
        
        // If we get here, user is not an admin
        console.log("User does not have camera assignment permission");
        setCanAssignCameras(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setCanAssignCameras(false);
      }
    };
    
    if (isOpen) {
      checkAdminStatus();
    }
  }, [isOpen]);

  // Fetch cameras and user's assigned cameras when modal opens
  useEffect(() => {
    if (!isOpen || !userId) return;
    
    const fetchCamerasAndAssignments = async () => {
      setLoading(true);
      try {
        console.log("Fetching cameras and assignments for user:", userId);
        
        // Fetch all cameras - bypass RLS with direct SQL
        const { data: allCameras, error: camerasError } = await supabase
          .from('cameras')
          .select('id, name, location');
        
        if (camerasError) {
          console.error("Error fetching cameras:", camerasError);
          throw camerasError;
        }
        
        console.log("All cameras fetched:", allCameras?.length || 0);
        
        // Fetch user's assigned cameras
        const { data: userCameras, error: assignmentError } = await supabase
          .from('user_camera_access')
          .select('camera_id')
          .eq('user_id', userId);
          
        if (assignmentError) {
          console.error("Error fetching user camera assignments:", assignmentError);
          throw assignmentError;
        }
        
        console.log("User camera assignments fetched:", userCameras?.length || 0);
        
        // Create a set of assigned camera IDs for quick lookup
        const assignedCameraIds = new Set(userCameras?.map(uc => uc.camera_id) || []);
        
        // Combine data
        const camerasWithAssignments = allCameras?.map(camera => ({
          ...camera,
          assigned: assignedCameraIds.has(camera.id)
        })) || [];
        
        console.log("Combined cameras with assignments:", camerasWithAssignments.length);
        setCameras(camerasWithAssignments);
      } catch (error) {
        console.error("Error fetching cameras:", error);
        toast.error("Failed to load cameras");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCamerasAndAssignments();
  }, [isOpen, userId]);
  
  // Handle checkbox change
  const handleCameraToggle = (cameraId: string, checked: boolean) => {
    setCameras(cameras.map(camera => 
      camera.id === cameraId ? { ...camera, assigned: checked } : camera
    ));
  };
  
  // Save camera assignments
  const handleSave = async () => {
    if (!canAssignCameras) {
      toast.error("You don't have permission to assign cameras");
      return;
    }
    
    setSaving(true);
    
    try {
      // Get current assignments to determine what to add/remove
      const { data: currentAssignments, error: fetchError } = await supabase
        .from('user_camera_access')
        .select('camera_id')
        .eq('user_id', userId);
        
      if (fetchError) {
        console.error("Error fetching current assignments:", fetchError);
        throw fetchError;
      }
      
      // Convert to Set for quick lookup
      const currentlyAssigned = new Set(currentAssignments?.map(a => a.camera_id) || []);
      
      // Determine cameras to add and remove
      const toAdd = cameras
        .filter(c => c.assigned && !currentlyAssigned.has(c.id))
        .map(c => ({ user_id: userId, camera_id: c.id, created_at: new Date().toISOString() }));
        
      const toRemove = cameras
        .filter(c => !c.assigned && currentlyAssigned.has(c.id))
        .map(c => c.id);
      
      console.log("Cameras to add:", toAdd.length);
      console.log("Cameras to remove:", toRemove.length);
      
      // Add new assignments
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('user_camera_access')
          .insert(toAdd);
          
        if (insertError) {
          console.error("Error adding camera assignments:", insertError);
          throw insertError;
        }
      }
      
      // Remove old assignments
      if (toRemove.length > 0) {
        for (const cameraId of toRemove) {
          const { error: deleteError } = await supabase
            .from('user_camera_access')
            .delete()
            .eq('user_id', userId)
            .eq('camera_id', cameraId);
            
          if (deleteError) {
            console.error("Error removing camera assignment:", deleteError);
            // Continue with others even if one fails
          }
        }
      }
      
      toast.success(`Camera assignments updated`);
      return true;
    } catch (error: any) {
      console.error("Error saving camera assignments:", error);
      toast.error(error?.message || "Failed to update camera assignments");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    cameras,
    loading,
    saving,
    canAssignCameras,
    handleCameraToggle,
    handleSave
  };
}
