
import { useAuth } from "@/contexts/auth";
import { Permission, hasPermission, canManageRole } from "@/utils/permissionUtils";
import { UserRole } from "@/types/admin";
import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePermissions() {
  const { role: authRole, user } = useAuth();
  const [role, setRole] = useState<UserRole>(authRole);
  
  // Always fetch the most current role directly from the database
  useEffect(() => {
    if (user?.id) {
      const fetchCurrentRole = async () => {
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!error && data) {
            console.log(`[PERMISSIONS] Direct DB role fetch for ${user.id}: ${data.role}`);
            setRole(data.role as UserRole);
          } else {
            // Fallback to auth context
            console.log(`[PERMISSIONS] Using auth context role: ${authRole}`);
            setRole(authRole);
          }
        } catch (err) {
          console.error('[PERMISSIONS] Error fetching role:', err);
          setRole(authRole);
        }
      };
      
      fetchCurrentRole();
      
      // Set up subscription for role changes
      const subscription = supabase
        .channel('role-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('[PERMISSIONS] Role change detected:', payload);
          if (payload.new && typeof payload.new === 'object' && 'role' in payload.new) {
            console.log(`[PERMISSIONS] Updating role to: ${payload.new.role}`);
            setRole(payload.new.role as UserRole);
          }
        })
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id, authRole]);
  
  useEffect(() => {
    console.log("[PERMISSIONS] usePermissions hook initialized - Current role:", role);
  }, [role]);
  
  const checkPermission = useCallback((permission: Permission): boolean => {
    // Force more detailed logging for crucial permissions
    if (permission === 'view-footage:assigned' || permission === 'view-cameras:assigned') {
      console.log(`[PERMISSIONS] Critical permission check: ${permission} - Role: ${role}`);
      
      // Direct logic check for operators
      if (role === 'operator') {
        console.log(`[PERMISSIONS] Operator role detected - should have ${permission} permission`);
        return true;
      }
      
      // For other roles, go through normal permission check
      const result = hasPermission(role, permission);
      console.log(`[PERMISSIONS] Permission check result: ${result}`);
      return result;
    }
    
    const result = hasPermission(role, permission);
    console.log(`[PERMISSIONS] Permission check for ${permission} with role ${role}: ${result}`);
    return result;
  }, [role]);
  
  const checkCanManageRole = useCallback((targetRole: UserRole): boolean => {
    return canManageRole(role, targetRole);
  }, [role]);
  
  return {
    hasPermission: checkPermission,
    canManageRole: checkCanManageRole,
    currentRole: role // Export current role for components that need it
  };
}
