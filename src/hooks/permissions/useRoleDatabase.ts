
import { useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/contexts/auth/types";

/**
 * Sets up a database subscription for role changes
 */
export function useRoleDatabase(userId: string | undefined, onRoleUpdate: (newRole: UserRole) => void) {
  const subscriptionRef = useRef<any>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    console.log(`[ROLE SUBSCRIPTION] Setting up subscription for user: ${userId}`);
    
    // Set up subscription for role changes - optimized channel config
    if (!subscriptionRef.current) {
      const channelId = `role-${userId}-${Date.now()}`;
      
      console.log('[ROLE SUBSCRIPTION] Creating channel:', channelId);
      
      subscriptionRef.current = supabase
        .channel(channelId)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          console.log('[ROLE SUBSCRIPTION] Received role update:', payload);
          if (payload.new && typeof payload.new === 'object' && 'role' in payload.new) {
            const newRole = payload.new.role as UserRole;
            console.log('[ROLE SUBSCRIPTION] Setting new role:', newRole);
            onRoleUpdate(newRole);
          }
        })
        .subscribe((status) => {
          console.log(`[ROLE SUBSCRIPTION] Subscription status: ${status}`);
        });
        
      console.log('[ROLE SUBSCRIPTION] Subscription created');
    }
    
    return () => {
      console.log('[ROLE SUBSCRIPTION] Cleaning up subscription');
      
      if (subscriptionRef.current) {
        console.log('[ROLE SUBSCRIPTION] Unsubscribing from channel');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [userId, onRoleUpdate]);
  
  return {
    isSubscribed: !!subscriptionRef.current
  };
}
