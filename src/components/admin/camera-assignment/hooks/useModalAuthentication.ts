
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseModalAuthenticationReturn {
  isAuthenticated: boolean;
  authChecked: boolean;
  authError: string | null;
}

export function useModalAuthentication(isOpen: boolean): UseModalAuthenticationReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkAttempts, setCheckAttempts] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isOpen) {
        return;
      }
      
      try {
        // Check if user is logged in
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          if (isMounted) {
            console.error("Auth session check error:", error.message);
            setAuthError(error.message);
            setIsAuthenticated(false);
            setAuthChecked(true);
            
            // If we've tried multiple times, suggest refreshing the page
            if (checkAttempts > 1) {
              toast.error("Authentication issues persist. Try refreshing the page.");
            }
          }
          return;
        }
        
        if (!data.session) {
          if (isMounted) {
            console.warn("No active session found");
            setAuthError("No active session");
            setIsAuthenticated(false);
            setAuthChecked(true);
            
            // If we've tried multiple times, suggest logging in again
            if (checkAttempts > 1) {
              toast.error("Session not found. Please log in again.");
            }
          }
          return;
        }
        
        // Always try to refresh the token when checking auth
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.warn("Failed to refresh session in modal:", refreshError.message);
            // Continue with existing session if refresh fails
          } else {
            console.log("Session refreshed in modal");
          }
        } catch (refreshErr) {
          console.warn("Error in session refresh:", refreshErr);
          // Non-critical - continue
        }
        
        if (isMounted) {
          setIsAuthenticated(true);
          setAuthChecked(true);
          setAuthError(null);
          // Reset check attempts on success
          setCheckAttempts(0);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Modal authentication check error:", err);
          setAuthError(err?.message || "Authentication check failed");
          setIsAuthenticated(false);
          setAuthChecked(true);
          
          // Increment check attempts
          setCheckAttempts(prev => prev + 1);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, checkAttempts]);

  // If we're not authenticated after 3 attempts, show a more visible error
  useEffect(() => {
    if (checkAttempts >= 3 && !isAuthenticated && authChecked) {
      toast.error("Authentication failed. Please log in again.", {
        duration: 5000,
      });
      
      // Redirect to auth page if authentication repeatedly fails
      setTimeout(() => {
        // Store the current location to return to after authentication
        const currentPath = window.location.pathname;
        window.location.href = `/auth?returnTo=${encodeURIComponent(currentPath)}`;
      }, 1500);
    }
  }, [checkAttempts, isAuthenticated, authChecked]);

  return { isAuthenticated, authChecked, authError };
}
