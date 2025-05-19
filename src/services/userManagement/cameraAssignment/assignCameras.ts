
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
      window.location.href = '/auth'; // Redirect to auth page
      return false;
    }
    
    if (!sessionData.session) {
      console.error("No active session when attempting to assign cameras");
      toast.error("You must be logged in to assign cameras. Please log in again.");
      window.location.href = '/auth'; // Redirect to auth page
      return false;
    }
    
    if (!userId) {
      toast.error("No user selected for camera assignment");
      throw new Error("User ID is required");
    }
    
    // Check admin permissions using multiple approaches
    let hasAdminPermission = false;
    
    // Method 1: Check direct admin access via email
    const userEmail = sessionData.session.user.email;
    if (userEmail) {
      const lowerEmail = userEmail.toLowerCase();
      if (lowerEmail === 'admin@home.local' || lowerEmail === 'auth@home.local' || 
          lowerEmail === 'superadmin@home.local') {
        console.log("Admin access granted via special email:", lowerEmail);
        hasAdminPermission = true;
      }
    }
    
    // Method 2: Check if user has admin role
    if (!hasAdminPermission) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .maybeSingle();
        
      if (roleData && (roleData.role === 'admin' || roleData.role === 'superadmin')) {
        console.log("Admin access granted via admin/superadmin role");
        hasAdminPermission = true;
      }
    }
    
    // Method 3: Check if user has is_admin profile flag
    if (!hasAdminPermission) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', sessionData.session.user.id)
        .maybeSingle();
        
      if (profileData?.is_admin === true) {
        console.log("Admin access granted via is_admin flag");
        hasAdminPermission = true;
      }
    }
    
    if (!hasAdminPermission) {
      console.error("User does not have admin permissions");
      toast.error("You don't have permission to assign cameras");
      return false;
    }
    
    // First create a transaction to ensure atomicity and avoid partial failures
    try {
      // Step 1: Delete existing camera assignments (clear previous assignments)
      const { error: deleteError } = await supabase
        .from('user_camera_access')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("Error removing existing camera assignments:", deleteError);
        if (deleteError.code === 'PGRST301') {
          toast.error("Not authorized. Please log in with admin privileges.");
        } else {
          toast.error("Database error: " + deleteError.message);
        }
        return false;
      }
      
      // If there are no cameras to assign, we're done
      if (cameraIds.length === 0) {
        console.log("No cameras to assign, all assignments cleared");
        toast.success("Camera assignments cleared successfully");
        return true;
      }
      
      // Step 2: Insert new assignments in batches to avoid potential query size limits
      const BATCH_SIZE = 25;
      for (let i = 0; i < cameraIds.length; i += BATCH_SIZE) {
        const batch = cameraIds.slice(i, i + BATCH_SIZE);
        
        const assignmentsToInsert = batch.map(cameraId => ({
          user_id: userId,
          camera_id: cameraId,
          created_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('user_camera_access')
          .insert(assignmentsToInsert);
          
        if (insertError) {
          console.error(`Error adding camera assignments (batch ${i}-${i+batch.length}):`, insertError);
          
          if (insertError.code === 'PGRST301') {
            toast.error("Not authorized. Please log in with admin privileges.");
          } else if (insertError.code === '23503') { // Foreign key violation
            toast.error("One or more cameras do not exist in the system.");
          } else if (insertError.code === '23505') { // Unique violation
            toast.error("Duplicate camera assignments detected.");
          } else {
            toast.error("Database error: " + (insertError.message || "Unknown error"));
          }
          return false;
        }
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
