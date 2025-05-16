
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  
  useEffect(() => {
    const checkForAdmins = async () => {
      try {
        // First try to find admin by role
        const { data: adminRoles, error: adminRolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['admin', 'superadmin'])
          .limit(1);
          
        if (!adminRolesError && adminRoles && adminRoles.length > 0) {
          console.log('Admin found by role:', adminRoles);
          setShowCreateAdmin(false);
          setAdminCheckComplete(true);
          return;
        }
        
        // If no admin roles, check for admin flag in profiles
        const { data: adminProfiles, error: adminProfilesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_admin', true)
          .limit(1);
        
        if (!adminProfilesError && adminProfiles && adminProfiles.length > 0) {
          console.log('Admin found by profile flag:', adminProfiles);
          setShowCreateAdmin(false);
          setAdminCheckComplete(true);
          return;
        }
        
        // If we get here, no admins exist - check profile count
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.warn('Error checking profiles:', error);
          // Don't automatically show create admin on error
          setShowCreateAdmin(false);
        } else if (count === 0) {
          console.log('No users found, showing create admin form');
          setShowCreateAdmin(true);
        } else {
          console.log('Users found but no admins:', count);
          setShowCreateAdmin(false);
        }
        
        setAdminCheckComplete(true);
      } catch (error) {
        console.error('Error checking for admin users:', error);
        setShowCreateAdmin(false);
        setAdminCheckComplete(true);
      }
    };
    
    checkForAdmins().catch(err => {
      console.error("Failed to check for admin users:", err);
      setAdminCheckComplete(true);
    });
  }, []);

  return {
    showCreateAdmin,
    setShowCreateAdmin,
    adminCheckComplete
  };
};
