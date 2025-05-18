
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { handleAuthError } from './useAuthState';

export function useSessionManager(
  setUser: (user: User | null) => void,
  setSession: (session: any) => void,
  setIsLoading: (loading: boolean) => void,
  setAuthInitialized: (initialized: boolean) => void,
  fetchUserData: (userId: string, user: User) => Promise<any>
) {
  // Setup the auth listener and handle session state
  useEffect(() => {
    console.log("[AUTH] Setting up auth state listener");
    setIsLoading(true);
    
    let mounted = true;
    
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        console.log("[AUTH] Auth state changed:", event, currentSession?.user?.email);
        
        try {
          // Update basic session state immediately
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Reset profile when signing out
          if (event === 'SIGNED_OUT') {
            // Profile and role reset will be handled by the parent component
            console.log("[AUTH] User signed out");
            return;
          }

          // Fetch user profile when signed in
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession?.user) {
            // Use setTimeout to prevent potential deadlocks with auth state changes
            setTimeout(async () => {
              if (!mounted) return;
              await fetchUserData(currentSession.user!.id, currentSession.user!);
            }, 0);
          }
        } catch (error) {
          handleAuthError(error, "Error processing authentication change");
        } finally {
          // Always update the initialized state once we've handled the auth state change
          if (mounted && !authInitialized) {
            setAuthInitialized(true);
            setIsLoading(false);
          }
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("[AUTH] Checking for existing session");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!mounted) return;
        
        console.log("[AUTH] Initial session check:", currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log("[AUTH] Session exists, fetching user data");
          await fetchUserData(currentSession.user.id, currentSession.user);
        } else {
          console.log("[AUTH] No session found");
        }
        
      } catch (error) {
        handleAuthError(error, "Error checking session");
      } finally {
        if (mounted) {
          setIsLoading(false);
          setAuthInitialized(true);
        }
      }
    };
    
    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      console.log("[AUTH] Auth listener cleaned up");
    };
  }, [setUser, setSession, setIsLoading, setAuthInitialized, fetchUserData]);
}
