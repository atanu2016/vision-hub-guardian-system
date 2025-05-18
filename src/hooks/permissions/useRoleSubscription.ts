
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/contexts/auth/types";
import { setCachedRole } from "@/services/userManagement/roleServices/roleCache";
import { useRoleDatabase } from "./useRoleDatabase";
import { useRoleFetching } from "./useRoleFetching";
import { useRolePolling } from "./useRolePolling";

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
  
  // Handle role updates from database or fetching
  const handleRoleUpdate = useCallback((newRole: UserRole) => {
    if (newRole !== role) {
      console.log('[ROLE SUBSCRIPTION] Updating role:', newRole);
      setRole(newRole);
      if (userId) {
        setCachedRole(userId, newRole);
      }
    }
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
  
  // Wrapper function for the polling mechanism with error handling
  const fetchRoleWrapper = useCallback(async () => {
    if (!userId) return;
    try {
      const fetchedRole = await fetchCurrentRole();
      handleRoleUpdate(fetchedRole as UserRole);
    } catch (err) {
      console.error('[ROLE SUBSCRIPTION] Error in fetchRoleWrapper:', err);
    }
  }, [userId, fetchCurrentRole, handleRoleUpdate]);
  
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
    }
  }, [authRole, userId, role]);
  
  // Initial role fetch
  useEffect(() => {
    if (userId) {
      fetchRoleWrapper();
    }
  }, [userId, fetchRoleWrapper]);
  
  return { 
    role, 
    authRole, 
    error,
    isLoading: isFetching && !role,
    isPolling: pollingData.isPolling,
    isSubscribed: dbSubscription.isSubscribed
  };
}
