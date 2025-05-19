
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Camera } from './types';
import { toast } from 'sonner';
import { checkCamerasExist, getCameraCount } from '@/services/database/camera/checkCamerasExist';

export function useCameraAssignment(userId: string, isOpen: boolean) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canAssignCameras, setCanAssignCameras] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if current user can assign cameras (admin check)
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check if we have cameras in the system first
        const hasCameras = await checkCamerasExist();
        if (!hasCameras) {
          console.log("No cameras found in the system");
          setCameras([]);
          setError(null); // Clear errors as this is not an error state
          setLoading(false);
          return;
        }
        
        // Check current user's email for quick admin verification
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
        
        // Try using a function to avoid RLS issues
        try {
          const { data: isAdmin, error: funcError } = await supabase.rpc('check_admin_status_safe');
          
          if (!funcError && isAdmin) {
            console.log("Admin status confirmed via function call");
            setCanAssignCameras(true);
            return;
          }
        } catch (funcErr) {
          console.warn("RPC function failed:", funcErr);
        }
        
        // If email doesn't match special admin emails, bypass RLS checks by directly checking the profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', sessionData.session.user?.id)
          .maybeSingle();
          
        if (profileData?.is_admin) {
          console.log("Admin flag found in profile, granting permission");
          setCanAssignCameras(true);
          return;
        }
        
        // Default to false if no admin status detected
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
      setError(null);
      try {
        console.log("Fetching cameras and assignments for user:", userId);
        
        // First check if we have any cameras in the system at all
        const cameraCount = await getCameraCount();
        
        if (cameraCount === 0) {
          console.log("No cameras found in the system");
          setCameras([]);
          setLoading(false);
          return;
        }
        
        // Direct query for all cameras to avoid RLS issues
        const { data: allCameras, error: camerasError } = await supabase
          .from('cameras')
          .select('id, name, location');
        
        if (camerasError) {
          if (camerasError.message?.includes('infinite recursion')) {
            setError("Permission error: There's an RLS policy conflict. Please contact system administrator.");
            console.error("RLS recursion error:", camerasError);
            setCameras([]);
            return;
          }
          
          console.error("Error fetching cameras:", camerasError);
          throw camerasError;
        }
        
        console.log("All cameras fetched:", allCameras?.length || 0);
        
        // Fetch user's assigned cameras with error handling for RLS
        let userCameras = [];
        try {
          const { data: accessData, error: accessError } = await supabase
            .from('user_camera_access')
            .select('camera_id')
            .eq('user_id', userId);
            
          if (accessError) {
            console.warn("Error fetching user camera assignments:", accessError);
            // Continue with empty assignments rather than failing completely
          } else {
            userCameras = accessData || [];
          }
        } catch (assignmentError) {
          console.warn("Failed to get camera assignments:", assignmentError);
          // Continue with empty assignments
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
      } catch (error: any) {
        console.error("Error fetching cameras:", error);
        
        // Special handling for known errors
        if (error.message?.includes('infinite recursion')) {
          setError("Database permission error. Please contact your system administrator.");
        } else {
          setError(error?.message || "Failed to load cameras");
        }
        
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
      return false;
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
          // Handle infinite recursion errors specifically
          if (insertError.message?.includes('recursion') || insertError.message?.includes('profiles')) {
            console.error("RLS policy recursion error detected:", insertError);
            toast.error("Permission error: Cannot assign cameras due to RLS policy conflict");
            return false;
          }
          
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
    error,
    handleCameraToggle,
    handleSave
  };
}
