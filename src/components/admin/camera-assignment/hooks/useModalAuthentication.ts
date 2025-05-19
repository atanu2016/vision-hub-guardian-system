
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

  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    let authTimeout: NodeJS.Timeout;
    
    const checkAuth = async () => {
      try {
        // Aggressive timeout to prevent hanging (1.5 seconds)
        authTimeout = setTimeout(() => {
          if (isMounted && !authChecked) {
            console.warn("Auth check timed out");
            setAuthChecked(true);
            setIsAuthenticated(false);
            setAuthError("Authentication check timed out");
          }
        }, 1500);
        
        // Use an optimized session check
        const { data, error } = await supabase.auth.getSession();
        
        clearTimeout(authTimeout);
        
        if (error) {
          if (isMounted) {
            setAuthError(error.message);
            setIsAuthenticated(false);
            setAuthChecked(true);
          }
          return;
        }
        
        if (isMounted) {
          setIsAuthenticated(!!data.session);
          setAuthError(null);
          setAuthChecked(true);
        }
      } catch (err: any) {
        clearTimeout(authTimeout);
        
        if (isMounted) {
          console.error("Authentication check error:", err);
          setAuthError(err?.message || "Authentication check failed");
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
    };
  }, [isOpen]);

  // Redirect to auth page if authentication fails
  useEffect(() => {
    if (authChecked && !isAuthenticated && authError) {
      toast.error("Authentication required. Please log in again.");
      
      // Redirect to auth page with a short delay
      setTimeout(() => {
        window.location.href = `/auth`;
      }, 500);
    }
  }, [authChecked, isAuthenticated, authError]);

  return { isAuthenticated, authChecked, authError };
}
