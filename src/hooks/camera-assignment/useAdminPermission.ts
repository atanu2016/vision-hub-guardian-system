
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useAdminPermission() {
  const [canAssignCameras, setCanAssignCameras] = useState(false);

  // Check if current user can assign cameras (admin check)
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
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
    
    checkAdminStatus();
  }, []);

  return { canAssignCameras };
}
