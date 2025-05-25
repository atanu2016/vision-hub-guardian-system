
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Check if user has admin role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userData.user.id)
          .single();

        setHasAccess(profileData?.is_admin || false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  return { hasAccess, loading };
};
