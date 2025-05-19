
import { useContext, useState, useCallback, useEffect } from 'react';
import { Profile, UserRole, AuthContextType } from './types';
import { resetPassword, signIn, signOut } from './authActions';
import AuthContext from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  // Reset profile and role when user signs out
  const handleProfileReset = useCallback(() => {
    setProfile(null);
    setRole('user');
    console.log("[AUTH] Reset profile and role to defaults");
  }, []);

  // Handle sign-in function
  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    console.log("[AUTH] Signing in user:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("[AUTH] Sign in error:", error.message);
        toast.error(error.message || "Login failed");
        return false;
      }
      
      if (!data.session || !data.user) {
        console.error("[AUTH] Sign in failed: No session or user returned");
        toast.error("Authentication failed. Please try again.");
        return false;
      }
      
      console.log("[AUTH] Sign in successful for:", email);
      return true;
    } catch (error: any) {
      console.error("[AUTH] Sign in exception:", error.message);
      toast.error(error.message || "Login failed");
      return false;
    }
  };

  // Handle sign-out function
  const handleSignOut = async () => {
    console.log("[AUTH] Signing out user");
    try {
      // Show a loading message
      toast.loading('Signing out...');
      
      // Clear Supabase stored session first
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("[AUTH] Sign out error:", error.message);
        toast.dismiss();
        toast.error(error.message || 'Failed to sign out');
        throw error;
      }
      
      // Clear any stored tokens from browser's local/session storage
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.removeItem("supabase.auth.token");
      
      // Reset profile and role
      handleProfileReset();
      
      // Show success message before redirect
      toast.dismiss();
      toast.success('Successfully signed out');
      
      // Force hard navigation to auth page with a small delay
      setTimeout(() => {
        console.log("[AUTH] Redirecting to auth page after successful logout");
        window.location.href = '/auth';
      }, 800);
    } catch (error: any) {
      console.error("[AUTH] Sign out exception:", error.message);
      toast.dismiss();
      toast.error(error.message || 'Error signing out');
      throw error;
    }
  };

  // Handle reset password function
  const handleResetPassword = async (email: string) => {
    console.log("[AUTH] Resetting password for:", email);
    return resetPassword(email);
  };

  // Set up authentication listener and session management
  useEffect(() => {
    console.log("[AUTH] Setting up auth state listener");
    setIsLoading(true);
    
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[AUTH] Auth state changed:", event);
        
        // Update basic session state immediately
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Reset profile when signing out
        if (event === 'SIGNED_OUT') {
          handleProfileReset();
          setIsLoading(false);
          return;
        }

        // Fetch profile data when signed in
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession?.user) {
          try {
            // Fetch user profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
              
            if (profileError) {
              console.error("[AUTH] Error fetching profile:", profileError);
            } else if (profileData) {
              console.log("[AUTH] Profile loaded:", profileData);
              setProfile(profileData);
            }
            
            // Fetch user role
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentSession.user.id)
              .maybeSingle();
              
            if (roleError) {
              console.error("[AUTH] Error fetching role:", roleError);
            } else if (roleData?.role) {
              console.log("[AUTH] Role loaded:", roleData.role);
              setRole(roleData.role as UserRole);
            }
          } catch (error) {
            console.error("[AUTH] Error in profile/role fetch:", error);
          } finally {
            setIsLoading(false);
          }
        } else if (!currentSession) {
          setIsLoading(false);
        }
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AUTH] Session check error:", error);
          setIsLoading(false);
          return;
        }
        
        console.log("[AUTH] Initial session check:", existingSession?.user?.email || 'No session');
        
        // If we have a session, use the onAuthStateChange handler to process it
        // This avoids duplicating the profile/role fetch logic
        if (!existingSession) {
          setIsLoading(false);
          setAuthInitialized(true);
        }
      } catch (error) {
        console.error("[AUTH] Error checking session:", error);
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };
    
    // Execute the session check
    checkSession();

    // Update the authInitialized state after a short delay
    // This ensures that even if something goes wrong, the app won't be stuck in loading
    const initTimeout = setTimeout(() => {
      if (!authInitialized) {
        console.log("[AUTH] Forcing authInitialized state to true after timeout");
        setAuthInitialized(true);
        setIsLoading(false);
      }
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(initTimeout);
      console.log("[AUTH] Auth listener cleaned up");
    };
  }, [handleProfileReset]);

  const requiresMFA = !!(profile?.mfa_required && !profile?.mfa_enrolled);
  
  // Check both profile.is_admin and role for admin status
  const isAdmin = role === 'admin' || role === 'superadmin' || !!profile?.is_admin;
  const isSuperAdmin = role === 'superadmin' || (!!profile?.is_admin && role === 'admin');

  const contextValue: AuthContextType = {
    session,
    user,
    profile,
    role,
    isLoading,
    isAdmin,
    isSuperAdmin,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    requiresMFA,
    authInitialized,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
