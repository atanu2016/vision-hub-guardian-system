
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
        } else if (error) {
          console.error('[PERMISSIONS] Error fetching role:', error);
          setRole(authRole);
        } else {
          setRole(authRole);
        }
        
        // Special handling for test accounts
        if (user.email === 'operator@home.local') {
          // Make sure operator@home.local users have user role
          if (!data || data.role !== 'user') {
            await supabase
              .from('user_roles')
              .upsert({ 
                user_id: user.id, 
                role: 'user',
                updated_at: new Date().toISOString() 
              }, { onConflict: 'user_id' });
          }
        } else if (user.email === 'user@home.local') {
          // Make sure user@home.local users have user role
          if (!data || data.role !== 'user') {
            await supabase
              .from('user_roles')
              .upsert({ 
                user_id: user.id, 
                role: 'user',
                updated_at: new Date().toISOString() 
              }, { onConflict: 'user_id' });
          }
        }
      } catch (err) {
        console.error('[PERMISSIONS] Error fetching role:', err);
        setRole(authRole);
      }
    };
    
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
          }
        })
        .subscribe();
    }
    
    // Refresh permissions every 30 seconds - increased from 10 seconds
    const intervalId = setInterval(() => {
      fetchCurrentRole();
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
