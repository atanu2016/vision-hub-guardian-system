
import { useAuth } from "@/contexts/auth";
import { Permission, hasPermission, canManageRole } from "@/utils/permissionUtils";
import { UserRole } from "@/types/admin";
import { useEffect, useCallback, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Cache for user permissions
interface PermissionCache {
  [key: string]: {
    timestamp: number;
    result: boolean;
  }
}

export function usePermissions() {
  const { role: authRole, user } = useAuth();
  const [role, setRole] = useState<UserRole>(authRole);
  const permissionCacheRef = useRef<PermissionCache>({});
  const cacheTimeout = 10000; // 10 seconds cache timeout - reduced for faster updates
  const subscriptionRef = useRef<any>(null);
  
  // Always fetch the most current role directly from the database with optimization
  useEffect(() => {
    if (user?.id) {
      const fetchCurrentRole = async () => {
        try {
          console.log('[PERMISSIONS] Fetching current role for user:', user.id);
          
          // Fetch fresh role directly from database - critical for correct permissions
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!error && data) {
            console.log(`[PERMISSIONS] Direct DB role fetch for ${user.id}: ${data.role}`);
            setRole(data.role as UserRole);
            
            // Special handling for operator role
            if (data.role === 'operator') {
              console.log(`[PERMISSIONS] ▶️ OPERATOR ROLE detected from database - ensuring proper access`);
              localStorage.setItem('operator_role_confirmed', 'true');
            } else {
              localStorage.removeItem('operator_role_confirmed');
            }
            
            // Cache the result
            localStorage.setItem(`user_role_${user.id}`, data.role);
            localStorage.setItem(`user_role_time_${user.id}`, Date.now().toString());
          } else {
            // Fallback to auth context
            console.log(`[PERMISSIONS] Using auth context role: ${authRole}`);
            setRole(authRole);
            
            // Special handling for operator role from auth context
            if (authRole === 'operator') {
              console.log(`[PERMISSIONS] ▶️ OPERATOR ROLE detected from auth context - ensuring proper access`);
              localStorage.setItem('operator_role_confirmed', 'true');
            } else {
              localStorage.removeItem('operator_role_confirmed');
            }
          }
        } catch (err) {
          console.error('[PERMISSIONS] Error fetching role:', err);
          setRole(authRole);
          
          // Special handling for operator role from auth context after error
          if (authRole === 'operator') {
            console.log(`[PERMISSIONS] ▶️ OPERATOR ROLE detected from auth context (after error) - ensuring proper access`);
            localStorage.setItem('operator_role_confirmed', 'true');
          }
        }
      };
      
      // Initial fetch
      fetchCurrentRole();
      
      // Also refetch every 10 seconds for operator role to ensure permissions stay current
      const intervalId = setInterval(() => {
        if (role === 'operator' || authRole === 'operator') {
          console.log('[PERMISSIONS] Refreshing operator permissions');
          fetchCurrentRole();
        }
      }, 10000);
      
      // Set up subscription for role changes
      if (!subscriptionRef.current) {
        console.log('[PERMISSIONS] Setting up role change subscription');
        subscriptionRef.current = supabase
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
              
              // Special handling for operator role changes
              if (payload.new.role === 'operator') {
                console.log(`[PERMISSIONS] ▶️ OPERATOR ROLE change detected - ensuring proper access`);
                localStorage.setItem('operator_role_confirmed', 'true');
              } else {
                localStorage.removeItem('operator_role_confirmed');
              }
              
              // Clear permission cache on role change
              permissionCacheRef.current = {};
            }
          })
          .subscribe();
      }
        
      return () => {
        clearInterval(intervalId);
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
      };
    }
  }, [user?.id, authRole]);
  
  // Performance-optimized permission check with caching
  const checkPermission = useCallback((permission: Permission): boolean => {
    // Critical fast path for operator footage permissions - never fails
    if (role === 'operator') {
      if (permission === 'view-footage:assigned' || permission === 'view-cameras:assigned' || 
          permission === 'view-footage:all') {
        console.log(`[PERMISSIONS] ▶️ OPERATOR FAST PATH: Granting '${permission}'`);
        return true;
      }
      
      // Also check local storage as a backup confirmation
      if (localStorage.getItem('operator_role_confirmed') === 'true') {
        if (permission === 'view-footage:assigned' || permission === 'view-cameras:assigned' || 
            permission === 'view-footage:all') {
          console.log(`[PERMISSIONS] ▶️ OPERATOR BACKUP CONFIRMATION: Granting '${permission}'`);
          return true;
        }
      }
    }
    
    const cacheKey = `${role}:${permission}`;
    const now = Date.now();
    const cached = permissionCacheRef.current[cacheKey];
    
    if (cached && (now - cached.timestamp < cacheTimeout)) {
      return cached.result;
    }
    
    // Force more detailed logging for crucial permissions
    if (permission === 'view-footage:assigned' || permission === 'view-cameras:assigned' || 
        permission === 'view-footage:all') {
      console.log(`[PERMISSIONS] Critical permission check: ${permission} - Role: ${role}`);
      
      // Double-check operator role for these critical permissions
      if (role === 'operator' || authRole === 'operator') {
        console.log(`[PERMISSIONS] ▶️ Operator permission check - granting ${permission}`);
        // Cache the result
        permissionCacheRef.current[cacheKey] = {
          timestamp: now,
          result: true
        };
        return true;
      }
    }
    
    const result = hasPermission(role, permission);
    console.log(`[PERMISSIONS] Permission check: ${permission} for ${role} = ${result}`);
    
    // Cache the result
    permissionCacheRef.current[cacheKey] = {
      timestamp: now,
      result
    };
    
    return result;
  }, [role, authRole]);
  
  // Standard role management function
  const checkCanManageRole = useCallback((targetRole: UserRole): boolean => {
    const result = canManageRole(role, targetRole);
    return result;
  }, [role]);
  
  // Clear cache when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      permissionCacheRef.current = {};
    };
  }, [role, user?.id]);
  
  return {
    hasPermission: checkPermission,
    canManageRole: checkCanManageRole,
    currentRole: role
  };
}
