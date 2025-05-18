
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './types';

export function useRoleSubscriptionManager(
  userId: string | undefined,
  authInitialized: boolean,
  setRole: (role: UserRole) => void
) {
  // Effect to update role subscription when user changes
  useEffect(() => {
    let roleSubscription: any;
    let mounted = true;
    
    const setupRoleSubscription = async () => {
      if (!userId || !mounted) return;
      
      // Unsubscribe from previous subscription if exists
      if (roleSubscription) {
        roleSubscription.unsubscribe();
      }
      
      console.log("[AUTH] Setting up new role subscription for user:", userId);
      
      roleSubscription = supabase
        .channel(`auth-role-changes-${userId}-${Date.now()}`) // Use unique channel name with timestamp
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
        }, async (payload) => {
          if (!mounted) return;
          
          console.log('[AUTH] Role change detected in user effect:', payload);
          
          if (payload.new && typeof payload.new === 'object' && 'role' in payload.new) {
            console.log(`[AUTH] Updating role to: ${payload.new.role}`);
            setRole(payload.new.role as UserRole);
          }
        })
        .subscribe();
    };
    
    if (userId && authInitialized) {
      setupRoleSubscription();
    }
    
    return () => {
      mounted = false;
      if (roleSubscription) roleSubscription.unsubscribe();
    };
  }, [userId, authInitialized, setRole]);
}
