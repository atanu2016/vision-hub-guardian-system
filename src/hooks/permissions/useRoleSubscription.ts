
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/contexts/auth/types";
import { invalidateRoleCache, getCachedRole, setCachedRole } from "@/services/userManagement/roleServices/roleCache";

export function useRoleSubscription() {
  const { role: authRole, user } = useAuth();
  const [role, setRole] = useState<UserRole>(authRole);
  const subscriptionRef = useRef<any>(null);
  
  // Use memo to avoid unnecessary state updates
  const userId = useMemo(() => user?.id, [user?.id]);
  
  useEffect(() => {
    if (!userId) return;
    
    // Throttle database fetches
    let fetchInProgress = false;
    
    const fetchCurrentRole = async () => {
      if (fetchInProgress) return;
      fetchInProgress = true;
      
      try {
        // Batch cache operations for better performance
        const cachedRole = getCachedRole(userId);
        if (cachedRole) {
          setRole(cachedRole);
        }
        
        // Optimize the database query
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (!error && data) {
          const fetchedRole = data.role as UserRole;
          
          // Only update if role has changed to avoid render cycles
          if (fetchedRole !== role) {
            setRole(fetchedRole);
            setCachedRole(userId, fetchedRole);
          }
        } else if (error) {
          console.error('[PERMISSIONS] Error fetching role:', error);
          // Use cached value or fall back to auth role
          setRole(cachedRole || authRole);
        }
      } catch (err) {
        console.error('[PERMISSIONS] Error in role fetch:', err);
      } finally {
        fetchInProgress = false;
      }
    };
    
    // Initial fetch
    fetchCurrentRole();
    
    // Set up subscription for role changes - optimized channel config
    if (!subscriptionRef.current) {
      const channelId = `role-${userId}-${Date.now()}`;
      
      subscriptionRef.current = supabase
        .channel(channelId)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'role' in payload.new) {
            const newRole = payload.new.role as UserRole;
            setRole(newRole);
            setCachedRole(userId, newRole);
          }
        })
        .subscribe();
    }
    
    // Use less frequent polling (20 seconds) to reduce database load
    const intervalId = setInterval(fetchCurrentRole, 20000);
      
    return () => {
      clearInterval(intervalId);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [userId, authRole, role]);
  
  return { role, authRole };
}
