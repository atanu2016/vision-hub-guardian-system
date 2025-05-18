
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/contexts/auth/types";
import { getCachedRole, setCachedRole } from "@/services/userManagement/roleServices/roleCache";

/**
 * Hook to handle role fetching with optimizations
 */
export function useRoleFetching(userId: string | undefined, fallbackRole: UserRole) {
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const [fetchInProgress, setFetchInProgress] = useState(false);
  
  // Function to extract role value from potentially complex return type
  const extractRoleValue = (cachedResult: any): UserRole => {
    if (cachedResult === null) return fallbackRole;
    
    return typeof cachedResult === 'object' && 'role' in cachedResult 
      ? cachedResult.role as UserRole
      : cachedResult as UserRole;
  };
  
  // Function to fetch the current role from database
  const fetchCurrentRole = useCallback(async (forceRefresh = false): Promise<UserRole> => {
    // Only proceed if we have a user ID
    if (!userId) return fallbackRole;
    
    // Throttle fetches
    const now = Date.now();
    const MIN_FETCH_INTERVAL = 5000;
    
    if (fetchInProgress || (!forceRefresh && (now - lastFetchRef.current < MIN_FETCH_INTERVAL))) {
      // Use cached role if available during throttling
      const cachedRoleResult = getCachedRole(userId);
      return extractRoleValue(cachedRoleResult);
    }
    
    setFetchInProgress(true);
    lastFetchRef.current = now;
    
    try {
      console.log('[ROLE FETCHING] Fetching current role');
      setError(null);
      
      // First check cache for immediate response
      const cachedRoleResult = getCachedRole(userId);
      
      if (cachedRoleResult !== null && !forceRefresh) {
        const cachedRole = extractRoleValue(cachedRoleResult);
        console.log('[ROLE FETCHING] Using cached role:', cachedRole);
        setFetchInProgress(false);
        return cachedRole;
      }
      
      // Check cache age if we need fresh data
      const cachedWithTimestamp = getCachedRole(userId, true);
      const cacheTimestamp = cachedWithTimestamp && typeof cachedWithTimestamp === 'object' && 'timestamp' in cachedWithTimestamp 
        ? cachedWithTimestamp.timestamp 
        : 0;
        
      const cacheAge = now - cacheTimestamp;
      
      if (!forceRefresh && cacheAge < 30000 && cachedRoleResult !== null) {
        console.log('[ROLE FETCHING] Cache is fresh, skipping database query');
        setFetchInProgress(false);
        return extractRoleValue(cachedRoleResult);
      }
      
      // Try direct query without RLS via function
      try {
        const { data: functionResult, error: functionError } = await supabase
          .rpc('get_user_role', { _user_id: userId });
          
        if (!functionError && functionResult) {
          console.log('[ROLE FETCHING] Got role from function:', functionResult);
          const fetchedRole = functionResult as UserRole;
          setCachedRole(userId, fetchedRole);
          setFetchInProgress(false);
          return fetchedRole;
        }
      } catch (functionErr) {
        console.warn('[ROLE FETCHING] Function error:', functionErr);
        // Fall through to regular query
      }
      
      // Standard query as fallback
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (!error && data) {
        const fetchedRole = data.role as UserRole;
        console.log('[ROLE FETCHING] Fetched role from database:', fetchedRole);
        setCachedRole(userId, fetchedRole);
        setFetchInProgress(false);
        return fetchedRole;
      } else if (error) {
        console.error('[ROLE FETCHING] Error fetching role:', error);
        setError(error.message);
        
        // Try to use cached value
        if (cachedRoleResult !== null) {
          const fallbackRole = extractRoleValue(cachedRoleResult);
          console.log('[ROLE FETCHING] Using fallback cached role:', fallbackRole);
          setFetchInProgress(false);
          return fallbackRole;
        }
      }
      
      // Ultimate fallback
      console.log('[ROLE FETCHING] Falling back to authRole:', fallbackRole);
      setFetchInProgress(false);
      return fallbackRole;
      
    } catch (err) {
      console.error('[ROLE FETCHING] Error in role fetch:', err);
      setFetchInProgress(false);
      return fallbackRole;
    }
  }, [userId, fallbackRole]);
  
  return {
    fetchCurrentRole,
    isFetching: fetchInProgress,
    error
  };
}
