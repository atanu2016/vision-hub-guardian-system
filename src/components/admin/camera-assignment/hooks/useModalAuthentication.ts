
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
    let timeoutId: NodeJS.Timeout;
    
    const checkAuth = async () => {
      if (!isOpen) {
        return;
      }
      
      try {
        // Set a timeout to catch hangs
        const authTimeout = new Promise<{success: false, error: string}>(resolve => {
          timeoutId = setTimeout(() => {
            resolve({success: false, error: "Authentication check timed out"});
          }, 3000); // 3 second timeout
        });
        
        // Race between the actual auth check and the timeout
        const authCheckPromise = supabase.auth.getSession()
          .then(({ data, error }) => {
            clearTimeout(timeoutId);
            
            if (error) return { success: false, error: error.message };
            if (!data.session) return { success: false, error: "No active session" };
            
            return { success: true, data: data.session };
          })
          .catch(error => {
            return { success: false, error: error.message || "Unknown authentication error" };
          });
        
        // Use Promise.race to handle timeouts
        const result = await Promise.race([authCheckPromise, authTimeout]);
        
        if (isMounted) {
          if (!result.success) {
            setAuthError(result.error);
            setIsAuthenticated(false);
            
            // If we've tried multiple times, suggest logging in again
            if (checkAttempts > 1) {
              toast.error("Authentication issues. Please try logging in again.");
            }
          } else {
            setIsAuthenticated(true);
            setAuthError(null);
            // Reset check attempts on success
            setCheckAttempts(0);
          }
          
          // Always mark auth as checked to avoid hanging
          setAuthChecked(true);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Authentication check error:", err);
          setAuthError(err?.message || "Authentication check failed");
          setIsAuthenticated(false);
          setAuthChecked(true); // Always mark as checked to avoid hanging
          setCheckAttempts(prev => prev + 1);
        }
      }
    };
    
    checkAuth();
    
    // Set a backup timeout to ensure authChecked is always set
    const backupTimeout = setTimeout(() => {
      if (!authChecked && isMounted) {
        console.warn("Auth check taking too long, forcing completion");
        setAuthChecked(true);
        if (!isAuthenticated) {
          setAuthError("Authentication check timed out");
        }
      }
    }, 5000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(backupTimeout);
    };
  }, [isOpen, checkAttempts]);

  // If we're not authenticated after 2 attempts, show a more visible error
  useEffect(() => {
    if (checkAttempts >= 2 && !isAuthenticated && authChecked) {
      toast.error("Authentication failed. Please log in again.", {
        duration: 5000,
      });
      
      // Redirect to auth page if authentication repeatedly fails
      setTimeout(() => {
        window.location.href = `/auth`;
      }, 1000);
    }
  }, [checkAttempts, isAuthenticated, authChecked]);

  return { isAuthenticated, authChecked, authError };
}
