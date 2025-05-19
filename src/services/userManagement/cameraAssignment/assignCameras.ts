
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Assigns cameras to a specific user
 */
export async function assignCamerasToUser(userId: string, cameraIds: string[]): Promise<boolean> {
  try {
    console.log(`Assigning cameras to user ${userId}. Camera IDs:`, cameraIds);
    
    // Check for valid session before making any requests
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      toast.error("Authentication error. Please log in again.");
      return false;
    }
    
    if (!sessionData.session) {
      console.error("No active session when attempting to assign cameras");
      toast.error("You must be logged in to assign cameras. Please log in again.");
      return false;
    }
    
    if (!userId) {
      toast.error("No user selected for camera assignment");
      throw new Error("User ID is required");
    }
    
    // First, check if we have admin permissions - try multiple methods to ensure reliability
    let hasAdminPermission = false;
    
    // Method 1: Check if user is admin@home.local or auth@home.local
    const userEmail = sessionData.session.user.email;
    if (userEmail) {
      const lowerEmail = userEmail.toLowerCase();
      if (lowerEmail === 'admin@home.local' || lowerEmail === 'auth@home.local' || 
          lowerEmail === 'superadmin@home.local') {
        console.log("Admin access granted via special email:", lowerEmail);
        hasAdminPermission = true;
      }
    }
    
    // Method 2: Check if user has is_admin in profile
    if (!hasAdminPermission) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', sessionData.session.user.id)
          .maybeSingle();
          
        if (profileData?.is_admin === true) {
          console.log("Admin access granted via is_admin flag in profile");
          hasAdminPermission = true;
        }
      } catch (profileError) {
        console.error("Error checking profile is_admin:", profileError);
      }
    }
    
    // Method 3: Check if user has superadmin role
    if (!hasAdminPermission) {
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle();
          
        if (roleData && roleData.role === 'superadmin') {
          console.log("Admin access granted via superadmin role");
          hasAdminPermission = true;
        }
      } catch (roleError) {
        console.error("Error checking user role:", roleError);
      }
    }
    
    // If none of the admin checks passed, try the RPC function
    if (!hasAdminPermission) {
      try {
        const { data: isAdmin } = await supabase.rpc(
          'check_if_user_is_admin'
        );
        
        if (isAdmin === true) {
          console.log("Admin access granted via check_if_user_is_admin function");
          hasAdminPermission = true;
        }
      } catch (rpcError) {
        console.error("Error checking admin status via RPC:", rpcError);
      }
    }
    
    // Final check for admin permission
    if (!hasAdminPermission) {
      console.error("User does not have admin permissions");
      toast.error("You don't have permission to assign cameras");
      return false;
    }
    
    try {
      // First, delete all existing user-camera assignments to avoid stale data
      const { error: deleteError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("Error removing existing camera assignments:", deleteError);
        if (deleteError.code === 'PGRST301') {
          toast.error("Not authorized. Please log in with admin privileges.");
        } else {
          toast.error("Could not update camera assignments. Database error occurred.");
        }
        return false;
      }
      
      // If there are no cameras to assign, we're done (we already removed all assignments)
      if (cameraIds.length === 0) {
        console.log("No cameras to assign, all assignments cleared");
        toast.success("Camera assignments cleared successfully");
        return true;
      }
      
      // Prepare batch of assignments to insert
      const assignmentsToInsert = cameraIds.map(cameraId => ({
        user_id: userId,
        camera_id: cameraId,
        created_at: new Date().toISOString()
      }));
      
      // Insert all new assignments in a single batch operation
      const { error: insertError } = await supabase
        .from('user_camera_access')
        .insert(assignmentsToInsert);
        
      if (insertError) {
        console.error("Error adding camera assignments:", insertError);
        
        // Detailed error handling with more user-friendly messages
        if (insertError.code === 'PGRST301') {
          toast.error("Not authorized. Please log in with admin privileges.");
        } else if (insertError.code === '23503') { // Foreign key violation
          toast.error("One or more cameras do not exist in the system.");
          
          // Attempt to identify which cameras are causing the issue
          const { data: validCameras } = await supabase
            .from('cameras')
            .select('id')
            .in('id', cameraIds);
            
          const validCameraIds = validCameras?.map(cam => cam.id) || [];
          const invalidCameraIds = cameraIds.filter(id => !validCameraIds.includes(id));
          
          console.error("Invalid camera IDs:", invalidCameraIds);
        } else if (insertError.code === '23505') { // Unique violation
          toast.error("Duplicate camera assignments detected.");
        } else {
          toast.error("Database error: " + (insertError.message || "Unknown error"));
        }
        return false;
      }
      
      console.log(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
      toast.success(`Successfully assigned ${cameraIds.length} cameras to user ${userId}`);
      return true;
    } catch (innerError: any) {
      console.error('Error in insert operation:', innerError);
      toast.error("Database error during camera assignment");
      return false;
    }
  } catch (error: any) {
    console.error('Error assigning cameras to user:', error);
    toast.error(error?.message || "Could not update camera assignments");
    return false;
  }
}
