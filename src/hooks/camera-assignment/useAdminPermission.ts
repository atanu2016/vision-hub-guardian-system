
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useAdminPermission() {
  const [canAssignCameras, setCanAssignCameras] = useState(false);

  // Check if current user can assign cameras (admin check)
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Use our new security definer function that bypasses RLS
        const { data: isAdmin, error: funcError } = await supabase.rpc('check_if_user_is_admin');
        
        if (!funcError && isAdmin === true) {
          console.log("Admin status confirmed via bypass function");
          setCanAssignCameras(true);
          return;
        }
        
        // If function fails, fall back to email check
        if (funcError) {
          console.warn("Admin check function failed:", funcError);
          
          // Get current user email
          const { data: { session } } = await supabase.auth.getSession();
          const userEmail = session?.user?.email?.toLowerCase();
          
          // Special admin emails
          if (userEmail === 'admin@home.local' || userEmail === 'superadmin@home.local') {
            console.log(`Admin email detected: ${userEmail}, granting camera assignment permission`);
            setCanAssignCameras(true);
            return;
          }
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
