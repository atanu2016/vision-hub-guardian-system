
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/contexts/auth/types";
import { setCachedRole } from "@/services/userManagement/roleServices/roleCache";
import { supabase } from '@/integrations/supabase/client';

/**
 * Main hook for role subscription with optimizations
 */
export function useRoleSubscription() {
  // Get auth context with error handling for initialization
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.warn("[ROLE SUBSCRIPTION] Auth context not available yet, using defaults");
    // Return default values during initialization
    return { 
      role: 'user' as UserRole, 
      authRole: 'user' as UserRole, 
      error: "Auth context unavailable",
      isLoading: true,
      isPolling: false,
      isSubscribed: false
    };
  }

  // Extract auth values with fallbacks
  const authRole = (auth?.role || 'user') as UserRole;
  const userId = useMemo(() => auth?.user?.id, [auth?.user?.id]);
  
  // Local state for role
  const [role, setRole] = useState<UserRole>(authRole);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Direct role fetching with special email handling (no RLS recursion)
  const fetchRoleSafely = useCallback(async (): Promise<UserRole> => {
    if (!userId) return 'user' as UserRole;
    
    try {
      console.log('[ROLE SUBSCRIPTION] Direct role fetch for user:', userId);
      
      // First check for special accounts via session
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email?.toLowerCase();
      
      // Special case for admin emails
      if (userEmail === 'admin@home.local' || userEmail === 'superadmin@home.local') {
        console.log('[ROLE SUBSCRIPTION] Special admin email detected:', userEmail);
        return 'superadmin' as UserRole;
      }
      
      // Direct role query with no RLS issues
      try {
        const { data: directRoleData } = await supabase.rpc('get_user_role', {
          _user_id: userId
        });
        
        if (directRoleData) {
          console.log('[ROLE SUBSCRIPTION] Retrieved role via RPC:', directRoleData);
          return directRoleData as UserRole;
        }
      } catch (rpcErr) {
        console.warn('[ROLE SUBSCRIPTION] RPC error:', rpcErr);
        // Continue to fallback methods
      }
      
      // Fallback direct check - bypassing RLS
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (roleData?.role) {
          console.log('[ROLE SUBSCRIPTION] Retrieved role directly:', roleData.role);
          return roleData.role as UserRole;
        }
      } catch (directErr) {
        console.warn('[ROLE SUBSCRIPTION] Direct query error:', directErr);
      }
      
      // Fallback to default
      console.log('[ROLE SUBSCRIPTION] No role found, using default:', authRole);
      return authRole;
    } catch (err) {
      console.error('[ROLE SUBSCRIPTION] Error in fetchRoleSafely:', err);
      setError(err as Error);
      return authRole;
    }
  }, [userId, authRole]);
  
  // Initial role fetch and periodic updates
  useEffect(() => {
    if (!userId) {
      setRole(authRole);
      setIsLoading(false);
      return;
    }
    
    let isMounted = true;
    const fetchRole = async () => {
      try {
        setIsLoading(true);
        const fetchedRole = await fetchRoleSafely();
        
        if (isMounted) {
          setRole(fetchedRole);
          setCachedRole(userId, fetchedRole);
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error('[ROLE SUBSCRIPTION] Error fetching role:', err);
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchRole();
    
    // Periodic refresh every 10 seconds
    const intervalId = setInterval(fetchRole, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [userId, authRole, fetchRoleSafely]);
  
  // Simple event handler for realtime updates
  useEffect(() => {
    if (!userId) return;
    
    console.log('[ROLE SUBSCRIPTION] Setting up role change listener');
    
    // Set up subscription with minimal channel setup
    const channel = supabase
      .channel('role-updates')
      .on('broadcast', { event: 'role_change' }, async (payload) => {
        if (payload.payload && payload.payload.user_id === userId) {
          console.log('[ROLE SUBSCRIPTION] Role change broadcast received');
          const updatedRole = await fetchRoleSafely();
          setRole(updatedRole);
          setCachedRole(userId, updatedRole);
        }
      })
      .subscribe();
      
    return () => {
      console.log('[ROLE SUBSCRIPTION] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, fetchRoleSafely]);

  return { 
    role, 
    authRole, 
    error,
    isLoading,
    isPolling: false, // Simplified state
    isSubscribed: !!userId
  };
}
