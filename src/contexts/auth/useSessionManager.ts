
import { useEffect, useCallback, useRef } from 'react';
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
  // Track initialization state locally using refs
  const authInitializedRef = useRef(false);
  const mountedRef = useRef(true);
  const lastErrorRef = useRef<string | null>(null);
  const fetchingProfileRef = useRef(false);
  const authListenerSetRef = useRef(false);

  // Setup the auth listener and handle session state
  useEffect(() => {
    if (authListenerSetRef.current) return;
    
    console.log("[AUTH] Setting up auth state listener");
    setIsLoading(true);
    authListenerSetRef.current = true;
    
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mountedRef.current) return;
        
        console.log("[AUTH] Auth state changed:", event, "Session:", currentSession?.user?.email);
        
        try {
          // Update basic session state immediately
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Reset profile when signing out
          if (event === 'SIGNED_OUT') {
            console.log("[AUTH] User signed out, state updated");
            setIsLoading(false); // Update loading state on signout
            return;
          }

          // Fetch user profile when signed in - use a flag to prevent multiple simultaneous fetches
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && 
               currentSession?.user && 
               !fetchingProfileRef.current) {
            fetchingProfileRef.current = true;
            
            // Use setTimeout to prevent potential deadlocks with auth state changes
            setTimeout(async () => {
              if (!mountedRef.current) return;
              
              try {
                await fetchUserData(currentSession.user!.id, currentSession.user!);
                
                // Clear any previous login errors on successful sign-in
                if (event === 'SIGNED_IN') {
                  lastErrorRef.current = null;
                }
              } catch (error) {
                console.error("[AUTH] Error fetching user data:", error);
              } finally {
                fetchingProfileRef.current = false;
                
                // Ensure loading is set to false after profile fetch
                if (mountedRef.current) {
                  setIsLoading(false);
                }
              }
            }, 0);
          } else if (!fetchingProfileRef.current) {
            // If we're not fetching a profile, update loading state
            setIsLoading(false);
          }
        } catch (error) {
          console.error("[AUTH] Error processing auth state change:", error);
          setIsLoading(false);
        } finally {
          // Always update the initialized state once we've handled the auth state change
          if (mountedRef.current && !authInitializedRef.current) {
            authInitializedRef.current = true;
            setAuthInitialized(true);
            setIsLoading(false);
          }
        }
      }
    );

    // Check for existing session with error handling
    const checkSession = async () => {
      try {
        console.log("[AUTH] Checking for existing session");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AUTH] Session check error:", error);
          throw error;
        }
        
        if (!mountedRef.current) return;
        
        console.log("[AUTH] Initial session check:", currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log("[AUTH] Session exists, fetching user data");
          try {
            await fetchUserData(currentSession.user.id, currentSession.user);
          } catch (fetchError) {
            console.error("[AUTH] Error fetching initial user data:", fetchError);
          } finally {
            // Always update loading state when done
            if (mountedRef.current) {
              setIsLoading(false);
            }
          }
        } else {
          console.log("[AUTH] No session found");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[AUTH] Error checking session:", error);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      } finally {
        if (mountedRef.current) {
          setAuthInitialized(true);
          authInitializedRef.current = true;
        }
      }
    };
    
    // Execute the session check
    checkSession();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      console.log("[AUTH] Auth listener cleaned up");
    };
  }, [setUser, setSession, setIsLoading, setAuthInitialized, fetchUserData]);
}
