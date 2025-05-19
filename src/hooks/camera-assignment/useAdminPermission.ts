
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useAdminPermission() {
  const [canAssignCameras, setCanAssignCameras] = useState(false);

  // Check if current user can assign cameras (admin check)
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get the current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session) {
          console.log("No active session found");
          setCanAssignCameras(false);
          return;
        }
        
        const userEmail = sessionData.session.user?.email?.toLowerCase();
        
        // SIMPLE CHECK 1: Special admin emails
        if (userEmail === 'admin@home.local' || userEmail === 'superadmin@home.local') {
          console.log(`Admin email detected: ${userEmail}, granting camera assignment permission`);
          setCanAssignCameras(true);
          return;
        }
        
        // SIMPLE CHECK 2: Try check_admin_status_safe function
        // Using a valid function from the error message list
        try {
          const { data: isAdmin, error: funcError } = await supabase.rpc('check_admin_status_safe');
          
          if (funcError) {
            console.warn("Admin check via check_admin_status_safe failed:", funcError);
          } else if (isAdmin) {
            console.log("Admin status confirmed via admin check function");
            setCanAssignCameras(true);
            return;
          }
        } catch (funcErr) {
          console.warn("Admin function check failed:", funcErr);
        }
        
        // SIMPLE CHECK 3: Check user_roles directly with normal query
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
            
          if (roleData && (roleData.role === 'admin' || roleData.role === 'superadmin')) {
            console.log("Admin status confirmed via role check", roleData.role);
            setCanAssignCameras(true);
            return;
          }
        } catch (roleErr) {
          console.warn("Role check failed:", roleErr);
        }
        
        console.log("No admin privileges confirmed, denying camera assignment permission");
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
