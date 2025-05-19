
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/contexts/auth/types';

export function useRoleSubscription() {
  const [role, setRole] = useState<UserRole>('user');
  const [authRole, setAuthRole] = useState<UserRole>('user');
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const setupRoleSubscription = async () => {
      try {
        // First get session to see if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not authenticated
          setIsLoading(false);
          return;
        }
        
        // Check if user email is special admin account
        const userEmail = session.user.email?.toLowerCase() || '';
        if (userEmail === 'admin@home.local' || userEmail === 'superadmin@home.local') {
          setRole('superadmin');
          setAuthRole('superadmin');
          setIsLoading(false);
          return;
        }
        
        // Get user role from database
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (roleError && roleError.code !== 'PGRST116') {  // PGRST116 is "no rows returned" error
          console.error('Error fetching user role:', roleError);
          if (isMounted) {
            setError(new Error(roleError.message));
          }
        }
        
        // Set role based on what we found in database, default to 'user' if not found
        if (roleData) {
          if (isMounted) {
            const userRole = roleData.role as UserRole;
            setRole(userRole);
            setAuthRole(userRole);
          }
        } else {
          // Check if observer role exists in profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && profileData.is_admin) {
            setRole('superadmin');
            setAuthRole('superadmin');
          } else {
            setRole('user');
            setAuthRole('user');
          }
        }
      } catch (err) {
        console.error('Exception in role subscription:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setupRoleSubscription();

    // Subscribe to role changes
    const channel = supabase
      .channel('role-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_roles'
      }, payload => {
        if (payload.new && isMounted) {
          const userRole = (payload.new as any).role as UserRole;
          setRole(userRole);
          setAuthRole(userRole);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { role, authRole, error, isLoading };
}
