
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { UserRole } from '@/contexts/auth/types';

export function useRoleSubscription() {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('user');
  const [authRole, setAuthRole] = useState<string>('user');
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effect to fetch the role of the current user
  useEffect(() => {
    // Reset state when user changes
    setRole('user');
    setAuthRole('user');
    setError(null);
    
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    const userId = user.id;
    setIsLoading(true);
    
    // Simple function to check for special admin emails
    const checkSpecialEmails = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email === 'admin@home.local' || userData.user?.email === 'superadmin@home.local') {
        setRole('superadmin');
        setAuthRole('superadmin');
        return true;
      }
      return false;
    };
    
    const fetchRole = async () => {
      try {
        // First check for special admin emails
        const isSpecialAdmin = await checkSpecialEmails();
        if (isSpecialAdmin) {
          setIsLoading(false);
          return;
        }
        
        // Try to get the role from vw_all_users view (which bypasses RLS)
        const { data: viewUser, error: viewError } = await supabase
          .from('vw_all_users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
          
        if (!viewError && viewUser?.role) {
          setRole(viewUser.role);
          setAuthRole(viewUser.role);
          setIsLoading(false);
          return;
        }
        
        // As a fallback, try to get role from user_roles table directly
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (roleError) {
          console.error('Error fetching role:', roleError);
          setError(roleError);
          setRole('user'); // Default if something goes wrong
        } else if (roleData) {
          setRole(roleData.role);
          setAuthRole(roleData.role);
        }
      } catch (e) {
        console.error('Exception fetching role:', e);
        setError(e instanceof Error ? e : new Error(String(e)));
        setRole('user'); // Default if something goes wrong
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRole();
    
    // Create a subscription for role changes
    const subscription = supabase
      .channel('role_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_roles',
        filter: `user_id=eq.${userId}`
      }, fetchRole)
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
    
  }, [user]);
  
  return { role, authRole, error, isLoading };
}
