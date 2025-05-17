
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/contexts/auth/types";

export function useRoleSubscription() {
  const { role: authRole, user } = useAuth();
  const [role, setRole] = useState<UserRole>(authRole);
  const subscriptionRef = useRef<any>(null);
  
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchCurrentRole = async () => {
      try {
        // Fetch fresh role directly from database
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (!error && data) {
          setRole(data.role as UserRole);
          
          // Cache role information
          localStorage.setItem(`user_role_${user.id}`, data.role);
          localStorage.setItem(`user_role_time_${user.id}`, Date.now().toString());
          
          // Handle special role flags
          updateRoleFlags(data.role);
        } else if (error) {
          console.error('[PERMISSIONS] Error fetching role:', error);
          setRole(authRole);
          updateRoleFlags(authRole);
        } else {
          setRole(authRole);
          updateRoleFlags(authRole);
        }
        
        // Handle special cases for test accounts
        if (user.email === 'operator@home.local') {
          setRole('operator');
          localStorage.setItem('operator_role_confirmed', 'true');
          
          // Update role in database if needed
          if (!data || data.role !== 'operator') {
            await supabase
              .from('user_roles')
              .upsert({ 
                user_id: user.id, 
                role: 'operator',
                updated_at: new Date().toISOString() 
              }, { onConflict: 'user_id' });
          }
        } else if (user.email === 'user@home.local') {
          if (!data || (data.role !== 'monitoringOfficer' && data.role === 'user')) {
            await supabase
              .from('user_roles')
              .upsert({ 
                user_id: user.id, 
                role: 'monitoringOfficer',
                updated_at: new Date().toISOString() 
              }, { onConflict: 'user_id' });
            
            setRole('monitoringOfficer');
            localStorage.setItem('monitoring_officer_confirmed', 'true');
          }
        }
      } catch (err) {
        console.error('[PERMISSIONS] Error fetching role:', err);
        setRole(authRole);
        updateRoleFlags(authRole);
      }
    };
    
    // Helper function to update role flags
    function updateRoleFlags(roleValue: string) {
      // Clear existing flags first
      localStorage.removeItem('operator_role_confirmed');
      localStorage.removeItem('monitoring_officer_confirmed');
      
      // Set appropriate flag based on role
      if (roleValue === 'operator') {
        localStorage.setItem('operator_role_confirmed', 'true');
      } else if (roleValue === 'monitoringOfficer') {
        localStorage.setItem('monitoring_officer_confirmed', 'true');
      }
    }
    
    // Initial fetch
    fetchCurrentRole();
    
    // Set up subscription for role changes - with optimized checks
    if (!subscriptionRef.current) {
      subscriptionRef.current = supabase
        .channel('role-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'role' in payload.new) {
            setRole(payload.new.role as UserRole);
            updateRoleFlags(payload.new.role as string);
          }
        })
        .subscribe();
    }
    
    // Refresh permissions every 30 seconds - increased from 10 seconds
    const intervalId = setInterval(() => {
      // Only refresh for special roles
      const currentRole = localStorage.getItem(`user_role_${user.id}`);
      if (currentRole === 'operator' || currentRole === 'monitoringOfficer') {
        fetchCurrentRole();
      }
    }, 30000);
      
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
