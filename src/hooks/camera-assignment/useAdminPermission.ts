
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

export function useAdminPermission() {
  const [canAssignCameras, setCanAssignCameras] = useState(false);
  const [checking, setChecking] = useState(true);
  const { hasPermission } = usePermissions();

  // Enhanced check if current user can assign cameras (admin check)
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setChecking(true);
        
        // Check for valid session before making any requests
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error("No valid session found when checking admin status");
          setCanAssignCameras(false);
          setChecking(false);
          return;
        }
        
        // Method 1: Check using our permission system
        try {
          const hasAssignPermission = await hasPermission('assign-cameras');
          if (hasAssignPermission) {
            console.log("User has assign-cameras permission");
            setCanAssignCameras(true);
            setChecking(false);
            return;
          }
        } catch (permError) {
          console.error("Error checking assign-cameras permission:", permError);
          // Continue with other checks
        }
        
        // Method 2: Use our security definer function that only checks roles
        try {
          const { data: isAdmin, error: funcError } = await supabase.rpc('check_if_user_is_admin');
          
          if (!funcError && isAdmin === true) {
            console.log("Admin status confirmed via role check function");
            setCanAssignCameras(true);
            setChecking(false);
            return;
          }
          
          if (funcError) {
            console.error("Admin check function failed:", funcError);
            // Continue with other checks
          }
        } catch (rpcError) {
          console.error("Error in RPC admin check:", rpcError);
          // Continue with other checks
        }
        
        // Method 3: Check is_admin in profiles
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', sessionData.session.user.id)
            .maybeSingle();
            
          if (!profileError && profileData?.is_admin === true) {
            console.log("User has is_admin=true in profile");
            setCanAssignCameras(true);
            setChecking(false);
            return;
          }
          
          if (profileError) {
            console.error("Error checking profile admin status:", profileError);
            // Continue with other checks
          }
        } catch (profileCheckError) {
          console.error("Error in profile admin check:", profileCheckError);
          // Continue with other checks
        }
        
        // Method 4: Check role in user_roles
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
            
          if (!roleError && roleData?.role === 'superadmin') {
            console.log("User has superadmin role");
            setCanAssignCameras(true);
            setChecking(false);
            return;
          }
          
          if (roleError) {
            console.error("Error checking user role:", roleError);
            // Continue with other checks
          }
        } catch (roleCheckError) {
          console.error("Error in role check:", roleCheckError);
          // Continue with other checks
        }
        
        // Method 5: Check if special admin email
        try {
          const userEmail = sessionData.session.user.email;
          if (userEmail && (userEmail.toLowerCase() === 'admin@home.local' || 
                           userEmail.toLowerCase() === 'superadmin@home.local')) {
            console.log("User has special admin email:", userEmail);
            setCanAssignCameras(true);
            setChecking(false);
            return;
          }
        } catch (emailCheckError) {
          console.error("Error in email check:", emailCheckError);
          // Continue with other checks
        }
        
        // If we reach here, the user doesn't have admin privileges
        console.log("User does not have admin privileges");
        setCanAssignCameras(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setCanAssignCameras(false);
      } finally {
        setChecking(false);
      }
    };
    
    checkAdminStatus();
  }, [hasPermission]);

  return { canAssignCameras, checking };
}
