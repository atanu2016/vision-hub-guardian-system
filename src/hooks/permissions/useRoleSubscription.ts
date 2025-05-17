import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/contexts/auth/types";
import { invalidateRoleCache, getCachedRole, setCachedRole } from "@/services/userManagement/roleServices/roleCache";

export function useRoleSubscription() {
  const { role: authRole, user } = useAuth();
  const [role, setRole] = useState<UserRole>(authRole);
  const subscriptionRef = useRef<any>(null);
  const fetchTimerRef = useRef<number | null>(null);
  const lastFetchRef = useRef<number>(0);
  
  // Use memo to avoid unnecessary state updates
  const userId = useMemo(() => user?.id, [user?.id]);
  
  // Clear fetch timer on unmount
  useEffect(() => {
    return () => {
      if (fetchTimerRef.current) {
        clearInterval(fetchTimerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!userId) return;
    
    console.log(`[ROLE SUBSCRIPTION] Setting up subscription for user: ${userId}`);
    
    // Throttle database fetches - minimum 5 seconds between fetches
    const MIN_FETCH_INTERVAL = 5000;
    let fetchInProgress = false;
    
    const fetchCurrentRole = async () => {
      // Throttle fetches
      const now = Date.now();
      if (fetchInProgress || (now - lastFetchRef.current < MIN_FETCH_INTERVAL)) {
        return;
      }
      
      fetchInProgress = true;
      lastFetchRef.current = now;
      
      try {
        console.log('[ROLE SUBSCRIPTION] Fetching current role');
        
        // Use cached role first for immediate response
        const cachedRole = getCachedRole(userId);
        if (cachedRole) {
          console.log('[ROLE SUBSCRIPTION] Using cached role:', cachedRole);
          setRole(cachedRole);
        }
        
        // Only fetch from database if cache is older than 30 seconds
        const cacheAge = now - (getCachedRole(userId, true)?.timestamp || 0);
        if (cacheAge < 30000 && cachedRole) {
          console.log('[ROLE SUBSCRIPTION] Cache is fresh, skipping database query');
          return;
        }
        
        // Optimize the database query
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (!error && data) {
          const fetchedRole = data.role as UserRole;
          console.log('[ROLE SUBSCRIPTION] Fetched role from database:', fetchedRole);
          
          // Only update if role has changed to avoid render cycles
          if (fetchedRole !== role) {
            setRole(fetchedRole);
            setCachedRole(userId, fetchedRole);
          }
        } else if (error) {
          console.error('[ROLE SUBSCRIPTION] Error fetching role:', error);
          // Use cached value or fall back to auth role
          const fallbackRole = cachedRole || authRole;
          console.log('[ROLE SUBSCRIPTION] Using fallback role:', fallbackRole);
          setRole(fallbackRole);
        }
      } catch (err) {
        console.error('[ROLE SUBSCRIPTION] Error in role fetch:', err);
      } finally {
        fetchInProgress = false;
      }
    };
    
    // Initial fetch with slight delay to avoid race conditions
    setTimeout(fetchCurrentRole, 200);
    
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
            setRole(newRole);
            setCachedRole(userId, newRole);
          }
        })
        .subscribe((status) => {
          console.log(`[ROLE SUBSCRIPTION] Subscription status: ${status}`);
        });
        
      console.log('[ROLE SUBSCRIPTION] Subscription created');
    }
    
    // Use less frequent polling (30 seconds) to reduce database load but keep roles fresh
    if (fetchTimerRef.current) {
      clearInterval(fetchTimerRef.current);
    }
    
    fetchTimerRef.current = window.setInterval(fetchCurrentRole, 30000) as unknown as number;
      
    return () => {
      console.log('[ROLE SUBSCRIPTION] Cleaning up');
      if (fetchTimerRef.current) {
        clearInterval(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
      
      if (subscriptionRef.current) {
        console.log('[ROLE SUBSCRIPTION] Unsubscribing from channel');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [userId, authRole, role]);
  
  // Update local role when authRole changes
  useEffect(() => {
    if (authRole !== role && !userId) {
      console.log('[ROLE SUBSCRIPTION] Updating role from authRole:', authRole);
      setRole(authRole);
    }
  }, [authRole, userId, role]);
  
  return { role, authRole };
}
