
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useAdminPermission() {
  const [canAssignCameras, setCanAssignCameras] = useState(false);

  // Check if current user can assign cameras (admin check)
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Use our security definer function that only checks roles
        const { data: isAdmin, error: funcError } = await supabase.rpc(
          'check_if_user_is_admin' as any
        );
        
        if (!funcError && isAdmin === true) {
          console.log("Admin status confirmed via role check");
          setCanAssignCameras(true);
          return;
        }
        
        // If function fails, log error and set permission to false
        if (funcError) {
          console.error("Admin check function failed:", funcError);
        }
        
        setCanAssignCameras(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setCanAssignCameras(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  return { canAssignCameras };
}
