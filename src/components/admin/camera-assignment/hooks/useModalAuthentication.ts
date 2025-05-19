
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useModalAuthentication(isOpen: boolean) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Optimized authentication check - immediate check when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setAuthChecked(false);
    
    const checkAuth = async () => {
      try {
        // First use cached session to avoid network request if possible
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Authentication check failed:", error);
          setIsAuthenticated(false);
          toast.error("Authentication required. Please login again.");
          
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
          
        } else if (!data.session) {
          console.error("No active session found");
          setIsAuthenticated(false);
          toast.error("Your session has expired. Please login again.");
          
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
          
        } else {
          // We have a session, now verify it's still valid with a backend check
          try {
            // Use type assertion to work around TypeScript error for RPC function
            const { data: validCheck, error: validError } = await (supabase.rpc as any)('check_session_valid');
            
            if (validError) {
              console.warn("Session validation RPC failed (may not exist yet):", validError);
              // If RPC doesn't exist, assume session is valid since we have it
              setIsAuthenticated(true);
            } else if (validCheck !== true) {
              console.error("Session validation failed - returned false");
              setIsAuthenticated(false);
              toast.error("Session validation failed. Please login again.");
              setTimeout(() => window.location.href = '/auth', 2000);
            } else {
              // Valid session confirmed by RPC
              setIsAuthenticated(true);
            }
          } catch (validationError) {
            // Fallback - if RPC fails assume session is valid since we have one
            console.warn("Error validating session (RPC may not exist):", validationError);
            setIsAuthenticated(true);
          }
        }
        
        setAuthChecked(true);
      } catch (err) {
        console.error("Authentication check error:", err);
        setIsAuthenticated(false);
        setAuthChecked(true);
        toast.error("Authentication error. Please try logging in again.");
      }
    };
    
    checkAuth();
  }, [isOpen]);

  // Auth state subscription - monitor for changes while modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const { data: { subscription }} = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        toast.error("Your session has ended. Please login again.");
        window.location.href = '/auth';
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setIsAuthenticated(true);
      } else if (event === 'USER_UPDATED' && session) {
        setIsAuthenticated(true);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen]);

  return { isAuthenticated, authChecked };
}
