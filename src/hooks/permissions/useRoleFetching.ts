
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/contexts/auth/types";
import { toast } from "sonner";

/**
 * Hook to fetch current user role from the database
 */
export function useRoleFetching(userId: string | undefined, defaultRole: UserRole = 'user') {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Enhanced fetch function that checks multiple sources for role information
  const fetchCurrentRole = useCallback(async () => {
    if (!userId) {
      console.log('[ROLE FETCHING] No user ID provided, returning default role:', defaultRole);
      return defaultRole;
    }
    
    setIsFetching(true);
    setError(null);
    
    try {
      console.log('[ROLE FETCHING] Fetching role for user:', userId);
      
      // First check - direct check for special admin emails
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email;
      
      if (userEmail) {
        const lowerEmail = userEmail.toLowerCase();
        if (lowerEmail === 'admin@home.local' || lowerEmail === 'superadmin@home.local') {
          console.log('[ROLE FETCHING] Special admin email detected:', userEmail);
          return 'superadmin' as UserRole;
        }
      }
      
      // Second check - check profiles table for is_admin flag
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();
        
      if (!profileError && profileData?.is_admin) {
        console.log('[ROLE FETCHING] Admin flag found in profile:', profileData);
        return 'admin' as UserRole;
      }
      
      // Third check - check user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (roleError && roleError.code !== 'PGRST116') {
        // PGRST116 means no rows returned
        console.error('[ROLE FETCHING] Error fetching role:', roleError);
        setError(roleError);
        throw roleError;
      }
      
      if (roleData && roleData.role) {
        console.log('[ROLE FETCHING] Role from database:', roleData.role);
        return roleData.role as UserRole;
      }
      
      // Return default role if nothing found
      console.log('[ROLE FETCHING] No role found in database, using default:', defaultRole);
      return defaultRole;
    } catch (err: any) {
      console.error('[ROLE FETCHING] Error in fetchCurrentRole:', err);
      setError(err);
      return defaultRole;
    } finally {
      setIsFetching(false);
    }
  }, [userId, defaultRole]);
  
  return {
    fetchCurrentRole,
    error,
    isFetching
  };
}
