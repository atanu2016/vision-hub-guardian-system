
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
            setAuthError(error.message);
            setIsAuthenticated(false);
            setAuthChecked(true);
          }
          return;
        }
        
        if (!data.session) {
          if (isMounted) {
            setAuthError("No active session");
            setIsAuthenticated(false);
            setAuthChecked(true);
          }
          return;
        }
        
        // Optional: Verify session is valid via RPC call
        try {
          // Using type assertion to fix TypeScript error
          const { data: validSession, error: validError } = await supabase.rpc('check_session_valid' as any);
          
          if (validError || !validSession) {
            if (isMounted) {
              setAuthError("Session validation failed");
              setIsAuthenticated(false);
              setAuthChecked(true);
            }
            return;
          }
        } catch (validationErr) {
          console.warn("Session validation check failed, continuing:", validationErr);
          // Non-critical - continue
        }
        
        if (isMounted) {
          setIsAuthenticated(true);
          setAuthChecked(true);
          setAuthError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setAuthError(err?.message || "Authentication check failed");
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  return { isAuthenticated, authChecked, authError };
}
