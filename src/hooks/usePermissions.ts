
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
  const cacheTimeout = 30000; // 30 seconds cache timeout
  const subscriptionRef = useRef<any>(null);
  
  // Always fetch the most current role directly from the database with optimization
  useEffect(() => {
    if (user?.id) {
      const fetchCurrentRole = async () => {
        try {
          // Check if we've fetched this role recently
          const now = Date.now();
          const cachedRole = localStorage.getItem(`user_role_${user.id}`);
          const cachedTimestamp = localStorage.getItem(`user_role_time_${user.id}`);
          
          if (cachedRole && cachedTimestamp && 
              (now - parseInt(cachedTimestamp, 10) < cacheTimeout)) {
            console.log(`[PERMISSIONS] Using cached role: ${cachedRole}`);
            setRole(cachedRole as UserRole);
            return;
          }
          
          // Fetch fresh role if not cached or cache expired
          console.log('[PERMISSIONS] Fetching role from database');
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!error && data) {
            console.log(`[PERMISSIONS] Direct DB role fetch for ${user.id}: ${data.role}`);
            setRole(data.role as UserRole);
            
            // Special logging for operator role
            if (data.role === 'operator') {
              console.log(`[PERMISSIONS] OPERATOR ROLE detected from database`);
            }
            
            // Cache the result
            localStorage.setItem(`user_role_${user.id}`, data.role);
            localStorage.setItem(`user_role_time_${user.id}`, now.toString());
          } else {
            // Fallback to auth context
            console.log(`[PERMISSIONS] Using auth context role: ${authRole}`);
            setRole(authRole);
            
            // Special logging for operator role
            if (authRole === 'operator') {
              console.log(`[PERMISSIONS] OPERATOR ROLE detected from auth context`);
            }
            
            // Cache this result too
            localStorage.setItem(`user_role_${user.id}`, authRole);
            localStorage.setItem(`user_role_time_${user.id}`, now.toString());
          }
        } catch (err) {
          console.error('[PERMISSIONS] Error fetching role:', err);
          setRole(authRole);
          
          // Special logging for operator role
          if (authRole === 'operator') {
            console.log(`[PERMISSIONS] OPERATOR ROLE detected from auth context (after error)`);
          }
        }
      };
      
      fetchCurrentRole();
      
      // Set up subscription for role changes - reuse existing subscription if possible
      if (subscriptionRef.current) {
        console.log('[PERMISSIONS] Reusing existing subscription');
      } else {
        console.log('[PERMISSIONS] Setting up new subscription');
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
              
              // Cache update
              localStorage.setItem(`user_role_${user.id}`, payload.new.role as string);
              localStorage.setItem(`user_role_time_${user.id}`, Date.now().toString());
              
              // Clear permission cache on role change
              permissionCacheRef.current = {};
            }
          })
          .subscribe();
      }
        
      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
      };
    }
  }, [user?.id, authRole]);
  
  // Performance-optimized permission check with caching
  const checkPermission = useCallback((permission: Permission): boolean => {
    // Immediately return true for crucial operator permissions without caching
    if (role === 'operator' && 
        (permission === 'view-footage:assigned' || 
         permission === 'view-cameras:assigned')) {
      console.log(`[PERMISSIONS] Operator fast path permission: ${permission} = true`);
      return true;
    }
    
    const cacheKey = `${role}:${permission}`;
    const now = Date.now();
    const cached = permissionCacheRef.current[cacheKey];
    
    if (cached && (now - cached.timestamp < cacheTimeout)) {
      return cached.result;
    }
    
    // Force more detailed logging for crucial permissions
    if (permission === 'view-footage:assigned' || permission === 'view-cameras:assigned') {
      console.log(`[PERMISSIONS] Critical permission check: ${permission} - Role: ${role}`);
      
      // Direct logic check for operators
      if (role === 'operator') {
        console.log(`[PERMISSIONS] Operator role detected - should have ${permission} permission`);
        
        // Cache the result
        permissionCacheRef.current[cacheKey] = {
          timestamp: now,
          result: true
        };
        
        return true;
      }
      
      // For other roles, go through normal permission check
      const result = hasPermission(role, permission);
      console.log(`[PERMISSIONS] Permission check result: ${result}`);
      
      // Cache the result
      permissionCacheRef.current[cacheKey] = {
        timestamp: now,
        result
      };
      
      return result;
    }
    
    const result = hasPermission(role, permission);
    
    // Cache the result
    permissionCacheRef.current[cacheKey] = {
      timestamp: now,
      result
    };
    
    return result;
  }, [role]);
  
  const checkCanManageRole = useCallback((targetRole: UserRole): boolean => {
    const cacheKey = `manage:${role}:${targetRole}`;
    const now = Date.now();
    const cached = permissionCacheRef.current[cacheKey];
    
    if (cached && (now - cached.timestamp < cacheTimeout)) {
      return cached.result;
    }
    
    const result = canManageRole(role, targetRole);
    
    // Cache the result
    permissionCacheRef.current[cacheKey] = {
      timestamp: now,
      result
    };
    
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
