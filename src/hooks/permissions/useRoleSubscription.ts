
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
  // Get auth context
  const auth = useAuth();
  const authRole = auth?.role || 'user';
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
  
  // Set up role fetching mechanism
  const { 
    fetchCurrentRole, 
    error,
    isFetching 
  } = useRoleFetching(userId, authRole);
  
  // Wrapper function for the polling mechanism
  const fetchRoleWrapper = useCallback(async () => {
    if (!userId) return;
    try {
      const fetchedRole = await fetchCurrentRole();
      handleRoleUpdate(fetchedRole);
    } catch (err) {
      console.error('[ROLE SUBSCRIPTION] Error in fetchRoleWrapper:', err);
    }
  }, [userId, fetchCurrentRole, handleRoleUpdate]);
  
  // Set up database subscription
  const { isSubscribed } = useRoleDatabase(userId, handleRoleUpdate);
  
  // Set up polling mechanism
  const { isPolling } = useRolePolling(userId, fetchRoleWrapper);
  
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
    isPolling,
    isSubscribed
  };
}
