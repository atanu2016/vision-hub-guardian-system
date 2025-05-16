
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdminCheck() {
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  useEffect(() => {
    async function checkForAdminUsers() {
      try {
        console.log('Checking for admin users...');
        
        // First check for users with admin flag in profiles
        const { count: profileAdminCount, error: profileError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_admin', true);
        
        if (profileError) throw profileError;
        
        // Then check for users with superadmin role in user_roles
        const { count: roleAdminCount, error: roleError } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'superadmin');
        
        if (roleError) throw roleError;
        
        // Determine if we have any admin users through either method
        const totalAdmins = (profileAdminCount || 0) + (roleAdminCount || 0);
        console.log(`Found ${totalAdmins} admin users. Profile admins: ${profileAdminCount}, Role admins: ${roleAdminCount}`);
        
        // If no admin users exist, show the create admin form
        setShowCreateAdmin(totalAdmins === 0);
      } catch (error) {
        console.error('Error checking for admin users:', error);
        // In case of error, we don't want to block the UI completely
        setShowCreateAdmin(false);
      } finally {
        setAdminCheckComplete(true);
      }
    }

    checkForAdminUsers();
  }, []);

  return { showCreateAdmin, setShowCreateAdmin, adminCheckComplete };
}
