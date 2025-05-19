
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useModalAuthentication(isOpen: boolean) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Optimized authentication check - only runs once when modal opens
  useEffect(() => {
    if (!isOpen || authChecked) return;
    
    const checkAuth = async () => {
      try {
        // Use cached session when available to avoid network request
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.error("Authentication check failed:", error || "No session found");
          setIsAuthenticated(false);
          toast.error("You must be logged in to manage camera assignments");
          
          setTimeout(() => {
            window.location.href = '/auth';
          }, 1500);
        } else {
          setIsAuthenticated(true);
        }
        
        setAuthChecked(true);
      } catch (err) {
        console.error("Authentication check error:", err);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [isOpen, authChecked]);

  // Auth state subscription
  useEffect(() => {
    if (!isOpen) return;
    
    const { data: { subscription }} = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        window.location.href = '/auth';
      } else if (session) {
        setIsAuthenticated(true);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen]);

  return { isAuthenticated, authChecked };
}
