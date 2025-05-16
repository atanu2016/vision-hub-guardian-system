
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdminCheck() {
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  useEffect(() => {
    async function checkForAdminUsers() {
      try {
        // Check if any admin users exist
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_admin', true);
        
        if (error) throw error;
        
        // If no admin users exist, show the create admin form
        setShowCreateAdmin(count === 0);
      } catch (error) {
        console.error('Error checking for admin users:', error);
      } finally {
        setAdminCheckComplete(true);
      }
    }

    checkForAdminUsers();
  }, []);

  return { showCreateAdmin, setShowCreateAdmin, adminCheckComplete };
}
