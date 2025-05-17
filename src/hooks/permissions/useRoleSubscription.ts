
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/admin";
import { setCachedRole } from "@/services/userManagement/roleServices/roleCache";

export function useRoleSubscription() {
  const { role: authRole, user } = useAuth();
  const [role, setRole] = useState<UserRole>(authRole);
  const subscriptionRef = useRef<any>(null);
  
  // Always fetch the most current role directly from the database with optimization
  useEffect(() => {
    if (!user?.id) return;
    
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
          
          // Special handling for operator and monitoringOfficer roles
          if (data.role === 'operator') {
            console.log(`[PERMISSIONS] ▶️ OPERATOR ROLE detected from database - ensuring proper access`);
            localStorage.setItem('operator_role_confirmed', 'true');
          } else if (data.role === 'monitoringOfficer') {
            console.log(`[PERMISSIONS] 👁️ MONITORING OFFICER ROLE detected from database - ensuring proper access`);
            localStorage.setItem('monitoring_officer_confirmed', 'true');
          } else {
            localStorage.removeItem('operator_role_confirmed');
            localStorage.removeItem('monitoring_officer_confirmed');
          }
          
          // Cache the result
          localStorage.setItem(`user_role_${user.id}`, data.role);
          localStorage.setItem(`user_role_time_${user.id}`, Date.now().toString());
        } else if (error) {
          console.error('[PERMISSIONS] Error fetching role:', error);
          // Fallback to auth context
          console.log(`[PERMISSIONS] Using auth context role: ${authRole}`);
          setRole(authRole);
        } else {
          // No data found, fallback to auth context
          console.log(`[PERMISSIONS] No role found in database, using auth context role: ${authRole}`);
          setRole(authRole);
          
          // Special handling for operator role from auth context
          if (authRole === 'operator' || authRole === 'monitoringOfficer') {
            console.log(`[PERMISSIONS] ${authRole.toUpperCase()} ROLE detected from auth context - ensuring proper access`);
            if (authRole === 'operator') {
              localStorage.setItem('operator_role_confirmed', 'true');
            } else if (authRole === 'monitoringOfficer') {
              localStorage.setItem('monitoring_officer_confirmed', 'true');
            }
          }
        }
        
        // Special case for operator@home.local and user@home.local
        if (user.email === 'operator@home.local') {
          console.log(`[PERMISSIONS] operator@home.local detected - ensuring operator role`);
          setRole('operator');
          localStorage.setItem('operator_role_confirmed', 'true');
          
          // Update the role in the database if it doesn't match
          if (!data || data.role !== 'operator') {
            console.log(`[PERMISSIONS] Updating operator@home.local role in database`);
            await supabase
              .from('user_roles')
              .upsert({ 
                user_id: user.id, 
                role: 'operator',
                updated_at: new Date().toISOString() 
              }, { 
                onConflict: 'user_id' 
              });
          }
        } else if (user.email === 'user@home.local') {
          console.log(`[PERMISSIONS] user@home.local detected - checking if should be monitoringOfficer`);
          
          // For user@home.local, we want to make sure it has the correct role but not override
          // if it was manually assigned to monitoringOfficer
          if (!data || (data.role !== 'monitoringOfficer' && data.role === 'user')) {
            console.log(`[PERMISSIONS] Updating user@home.local role in database to monitoringOfficer`);
            await supabase
              .from('user_roles')
              .upsert({ 
                user_id: user.id, 
                role: 'monitoringOfficer',
                updated_at: new Date().toISOString() 
              }, { 
                onConflict: 'user_id' 
              });
            
            setRole('monitoringOfficer');
            localStorage.setItem('monitoring_officer_confirmed', 'true');
          }
        }
      } catch (err) {
        console.error('[PERMISSIONS] Error fetching role:', err);
        setRole(authRole);
        
        // Special handling for roles from auth context after error
        if (authRole === 'operator' || authRole === 'monitoringOfficer') {
          console.log(`[PERMISSIONS] ${authRole.toUpperCase()} ROLE detected from auth context (after error) - ensuring proper access`);
          if (authRole === 'operator') {
            localStorage.setItem('operator_role_confirmed', 'true');
          } else if (authRole === 'monitoringOfficer') {
            localStorage.setItem('monitoring_officer_confirmed', 'true');
          }
        }
      }
    };
    
    // Initial fetch
    fetchCurrentRole();
    
    // Also refetch every 10 seconds for special roles to ensure permissions stay current
    const intervalId = setInterval(() => {
      if (role === 'operator' || role === 'monitoringOfficer' || 
          authRole === 'operator' || authRole === 'monitoringOfficer') {
        console.log('[PERMISSIONS] Refreshing special role permissions');
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
            
            // Special handling for operator and monitoringOfficer role changes
            if (payload.new.role === 'operator') {
              console.log(`[PERMISSIONS] ▶️ OPERATOR ROLE change detected - ensuring proper access`);
              localStorage.setItem('operator_role_confirmed', 'true');
              localStorage.removeItem('monitoring_officer_confirmed');
            } else if (payload.new.role === 'monitoringOfficer') {
              console.log(`[PERMISSIONS] 👁️ MONITORING OFFICER ROLE change detected - ensuring proper access`);
              localStorage.setItem('monitoring_officer_confirmed', 'true');
              localStorage.removeItem('operator_role_confirmed');
            } else {
              localStorage.removeItem('operator_role_confirmed');
              localStorage.removeItem('monitoring_officer_confirmed');
            }
          }
        })
        .subscribe((status) => {
          console.log(`[PERMISSIONS] Subscription status: ${status}`);
        });
    }
      
    return () => {
      clearInterval(intervalId);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, authRole]);
  
  return { role, authRole };
}
