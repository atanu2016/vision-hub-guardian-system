
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/contexts/auth/types";
import { setCachedRole } from "@/services/userManagement/roleServices/roleCache";
import { useRoleDatabase } from "./useRoleDatabase";
import { useRoleFetching } from "./useRoleFetching";
import { useRolePolling } from "./useRolePolling";
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
  
  // Handle role updates from database or fetching
  const handleRoleUpdate = useCallback((newRole: UserRole) => {
    if (newRole !== role) {
      console.log('[ROLE SUBSCRIPTION] Updating role:', newRole);
      setRole(newRole);
      if (userId) {
        setCachedRole(userId, newRole);
      }
    }
    setIsLoading(false);
  }, [role, userId]);
  
  // Set up role fetching mechanism with error handling
  let fetchRoleData = { fetchCurrentRole: async () => authRole, error: null, isFetching: false };
  try {
    fetchRoleData = useRoleFetching(userId, authRole);
  } catch (error) {
    console.warn("[ROLE SUBSCRIPTION] Error setting up role fetching:", error);
  }
  
  const { 
    fetchCurrentRole, 
    error,
    isFetching 
  } = fetchRoleData;
  
  // Direct check from database using our SQL function
  const fetchRoleUsingFunction = useCallback(async () => {
    if (!userId) return authRole;
    
    try {
      console.log('[ROLE SUBSCRIPTION] Fetching role directly using SQL function');
      
      // First check email directly for admin accounts
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email;
      
      if (userEmail === 'admin@home.local' || userEmail === 'superadmin@home.local') {
        console.log('[ROLE SUBSCRIPTION] Special admin email detected, returning superadmin role');
        return 'superadmin' as UserRole;
      }
      
      // Then check profiles table for is_admin flag
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();
      
      if (!profileError && profileData?.is_admin) {
        console.log('[ROLE SUBSCRIPTION] Admin flag found in profile, returning admin role');
        return 'admin' as UserRole;
      }
      
      // Try getting role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (roleError) {
        console.error('[ROLE SUBSCRIPTION] Error fetching role from table:', roleError);
        return authRole;
      }
      
      if (roleData) {
        console.log('[ROLE SUBSCRIPTION] Role from table:', roleData.role);
        return roleData.role as UserRole;
      }
      
      return authRole;
    } catch (err) {
      console.error('[ROLE SUBSCRIPTION] Error in fetchRoleUsingFunction:', err);
      return authRole;
    }
  }, [userId, authRole]);
  
  // Wrapper function for the polling mechanism with error handling
  const fetchRoleWrapper = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      
      // First try using the SQL function
      const sqlFunctionRole = await fetchRoleUsingFunction();
      if (sqlFunctionRole && sqlFunctionRole !== 'user') {
        handleRoleUpdate(sqlFunctionRole as UserRole);
        return;
      }
      
      // Fall back to normal fetch
      const fetchedRole = await fetchCurrentRole();
      handleRoleUpdate(fetchedRole as UserRole);
    } catch (err) {
      console.error('[ROLE SUBSCRIPTION] Error in fetchRoleWrapper:', err);
      setIsLoading(false);
    }
  }, [userId, fetchCurrentRole, fetchRoleUsingFunction, handleRoleUpdate]);
  
  // Set up database subscription with error handling
  let dbSubscription = { isSubscribed: false };
  try {
    dbSubscription = useRoleDatabase(userId, handleRoleUpdate);
  } catch (error) {
    console.warn("[ROLE SUBSCRIPTION] Error setting up database subscription:", error);
  }
  
  // Set up polling mechanism with error handling
  let pollingData = { isPolling: false };
  try {
    pollingData = useRolePolling(userId, fetchRoleWrapper);
  } catch (error) {
    console.warn("[ROLE SUBSCRIPTION] Error setting up polling:", error);
  }
  
  // Update local role when authRole changes
  useEffect(() => {
    if (authRole !== role && !userId) {
      console.log('[ROLE SUBSCRIPTION] Updating role from authRole:', authRole);
      setRole(authRole);
      setIsLoading(false);
    }
  }, [authRole, userId, role]);
  
  // Initial role fetch
  useEffect(() => {
    if (userId) {
      fetchRoleWrapper();
    } else {
      setIsLoading(false);
    }
  }, [userId, fetchRoleWrapper]);
  
  return { 
    role, 
    authRole, 
    error,
    isLoading: isLoading || (isFetching && !role),
    isPolling: pollingData.isPolling,
    isSubscribed: dbSubscription.isSubscribed
  };
}
