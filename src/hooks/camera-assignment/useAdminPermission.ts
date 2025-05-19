
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useAdminPermission() {
  const [canAssignCameras, setCanAssignCameras] = useState(false);

  // Check if current user can assign cameras (admin check)
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Step 1: Check for special admin emails first - fastest and most reliable path
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData?.session) {
          console.log("No active session found");
          setCanAssignCameras(false);
          return;
        }
        
        const userEmail = sessionData.session.user?.email?.toLowerCase();
        const userId = sessionData.session.user?.id;
        
        // Special case for admin emails - guaranteed to work
        if (userEmail === 'admin@home.local' || userEmail === 'superadmin@home.local') {
          console.log(`Admin email detected: ${userEmail}, granting camera assignment permission`);
          setCanAssignCameras(true);
          return;
        }
        
        // Step 2: Try using the dedicated RPC function which is designed to avoid recursion
        console.log("Checking admin status via RPC function");
        try {
          const { data: isAdmin, error: funcError } = await supabase.rpc('check_admin_status_safe');
          
          if (!funcError) {
            console.log("RPC check result:", isAdmin);
            if (isAdmin) {
              console.log("Admin status confirmed via function call");
              setCanAssignCameras(true);
              return;
            }
          } else {
            console.warn("RPC function check_admin_status_safe failed:", funcError);
          }
        } catch (funcErr) {
          console.warn("RPC check failed:", funcErr);
        }
        
        // Step 3: Check user roles directly - should be safe with our fixed RLS
        try {
          const { data: userRoles, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (!rolesError && userRoles) {
            const role = userRoles.role;
            console.log(`Found user role: ${role}`);
            if (role === 'admin' || role === 'superadmin') {
              console.log("Admin role confirmed, granting permission");
              setCanAssignCameras(true);
              return;
            }
          }
        } catch (rolesErr) {
          console.warn("Roles check failed:", rolesErr);
        }
        
        // Default to false if no admin status detected through any method
        console.log("No admin privileges detected, denying camera assignment permission");
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
