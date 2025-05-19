
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/auth/types';

export function useRoleManagement(userId?: string) {
  const [role, setRole] = useState<UserRole>('user');
  
  // Fetch up-to-date role directly from database
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserRole = async () => {
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (roleData && !roleError) {
          console.log("[PROFILE] Fetched user role from database:", roleData.role);
          setRole(roleData.role as UserRole);
        } else if (roleError) {
          console.error("[PROFILE] Failed to fetch user role:", roleError);
        } else {
          console.log("[PROFILE] No role record found, defaulting to user");
          setRole('user');
        }
      } catch (error) {
        console.error("[PROFILE] Failed to fetch user role:", error);
      }
    };

    // Initial fetch
    fetchUserRole();
    
    // Set up realtime subscription for role changes
    const channel = supabase
      .channel('profile-role-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_roles',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('[PROFILE] Role change detected:', payload);
        if (payload.new && 'role' in payload.new) {
          setRole(payload.new.role as UserRole);
        }
      })
      .subscribe();

    // Refresh role every 10 seconds
    const intervalId = setInterval(fetchUserRole, 10000);

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Special handling for test accounts
  useEffect(() => {
    if (!userId) return;
    
    const handleTestAccount = async (email: string | undefined) => {
      if (!email) return;
      
      if ((email === 'user@home.local' || email === 'operator@home.local') && role !== 'user') {
        console.log(`[PROFILE] ${email} detected, but role is ${role}`);
        console.log("[PROFILE] Updating role to 'user'");
        
        try {
          await supabase
            .from('user_roles')
            .upsert({
              user_id: userId,
              role: 'user',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            
          setRole('user');
          console.log("[PROFILE] Role updated to user");
        } catch (error) {
          console.error("[PROFILE] Error updating role:", error);
        }
      }
    };
    
    return () => {
      // This is just to make the ESLint hooks dependency array happy
      // since we're not actually returning a cleanup function
    };
  }, [userId, role]);

  return {
    role
  };
}
