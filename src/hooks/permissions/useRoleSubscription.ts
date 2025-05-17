
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/contexts/auth/types";
import { invalidateRoleCache, getCachedRole, setCachedRole } from "@/services/userManagement/roleServices/roleCache";

export function useRoleSubscription() {
  const { role: authRole, user } = useAuth();
  const [role, setRole] = useState<UserRole>(authRole);
  const subscriptionRef = useRef<any>(null);
  
  useEffect(() => {
    if (!user?.id) return;
    
    console.log(`[Role Subscription] Initializing for user ${user.id}, starting with authRole: ${authRole}`);
    
    // Always invalidate cache on initial load to ensure fresh data
    invalidateRoleCache(user.id);
    
    const fetchCurrentRole = async () => {
      try {
        // First check if we have a cached role - but with reduced TTL
        const cachedRole = getCachedRole(user.id);
        if (cachedRole) {
          console.log(`[Role Subscription] Using cached role: ${cachedRole}`);
          setRole(cachedRole);
        }
        
        // Always fetch fresh role directly from database
        console.log(`[Role Subscription] Fetching fresh role for user ${user.id}`);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (!error && data) {
          const fetchedRole = data.role as UserRole;
          console.log(`[Role Subscription] Fetched role from database: ${fetchedRole} for user ${user.id} (${user.email || 'unknown'})`);
          
          // Only update if role has changed
          if (fetchedRole !== role) {
            console.log(`[Role Subscription] Role changed from ${role} to ${fetchedRole}`);
            setRole(fetchedRole);
            setCachedRole(user.id, fetchedRole);
          }
          
        } else if (error) {
          console.error('[PERMISSIONS] Error fetching role:', error);
          // Fallback to auth context role
          setRole(authRole);
        } else {
          // No role found, use auth role
          console.log(`[Role Subscription] No role record found, using authRole: ${authRole}`);
          setRole(authRole);
        }
        
        // Special handling for observer role
        if (data?.role === 'observer') {
          console.log(`[Role Subscription] Observer role detected, ensuring it's applied`);
          setRole('observer');
          setCachedRole(user.id, 'observer');
        }
        
        // Special handling for test accounts
        if (user.email === 'test@home.local') {
          console.log(`[Role Subscription] special account test@home.local detected, checking assigned role: ${data?.role}`);
          if (data?.role === 'observer') {
            console.log(`[Role Subscription] Confirmed observer role for test@home.local`);
          }
        }
        
      } catch (err) {
        console.error('[PERMISSIONS] Error fetching role:', err);
        setRole(authRole);
      }
    };
    
    // Initial fetch
    fetchCurrentRole();
    
    // Set up subscription for role changes with improved channel configuration
    if (!subscriptionRef.current) {
      console.log(`[Role Subscription] Setting up realtime subscription for user ${user.id}`);
      
      subscriptionRef.current = supabase
        .channel(`role-changes-${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log(`[Role Subscription] Received role change event:`, payload);
          if (payload.new && typeof payload.new === 'object' && 'role' in payload.new) {
            const newRole = payload.new.role as UserRole;
            console.log(`[Role Subscription] Setting new role from realtime event: ${newRole}`);
            setRole(newRole);
            setCachedRole(user.id, newRole);
            
            // Force session refresh when role changes
            supabase.auth.refreshSession().then(() => {
              console.log(`[Role Subscription] Session refreshed after role change`);
            });
          }
        })
        .subscribe((status) => {
          console.log(`[Role Subscription] Subscription status:`, status);
        });
    }
    
    // Shorten refresh interval to 10 seconds for more responsive updates
    const intervalId = setInterval(() => {
      fetchCurrentRole();
    }, 10000);
      
    return () => {
      clearInterval(intervalId);
      if (subscriptionRef.current) {
        console.log(`[Role Subscription] Cleaning up subscription`);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, authRole]);
  
  // Return both the current role and the authRole for fallback
  return { role, authRole };
}
