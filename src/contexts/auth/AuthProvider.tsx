
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, AuthState, Profile, UserRole } from './types';
import { fetchUserProfile, fetchUserRole } from './authUtils';
import { resetPassword, signIn, signOut } from './authActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[AUTH] Setting up auth state listener");
    
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("[AUTH] Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Reset profile when signing out
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setRole('user');
          console.log("[AUTH] User signed out, reset role to 'user'");
        }

        // Fetch user profile when signed in
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession?.user) {
          // Use setTimeout to avoid potential recursive auth state changes
          setTimeout(() => {
            console.log("[AUTH] Fetching profile for user:", currentSession.user?.id);
            fetchUserProfile(currentSession.user.id, currentSession.user)
              .then(profileData => {
                console.log("[AUTH] Profile data fetched:", profileData);
                if (profileData) setProfile(profileData);
              });
              
            console.log("[AUTH] Fetching role for user:", currentSession.user?.id);  
            fetchUserRole(currentSession.user.id, currentSession.user)
              .then(roleData => {
                console.log("[AUTH] Role data fetched:", roleData);
                setRole(roleData);
                console.log("[AUTH] Role set to:", roleData);
              });
          }, 0);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("[AUTH] Checking for existing session");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("[AUTH] Initial session check:", currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log("[AUTH] Session exists, fetching user data");
          const profileData = await fetchUserProfile(currentSession.user.id, currentSession.user);
          console.log("[AUTH] Profile data:", profileData);
          if (profileData) setProfile(profileData);
          
          const roleData = await fetchUserRole(currentSession.user.id, currentSession.user);
          console.log("[AUTH] Role data:", roleData, typeof roleData);
          setRole(roleData);
        } else {
          console.log("[AUTH] No session found");
        }
        
      } catch (error) {
        console.error("[AUTH] Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle sign-in, sign-out and reset password functions
  const handleSignIn = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const handleSignOut = async () => {
    return signOut(navigate);
  };

  const handleResetPassword = async (email: string) => {
    return resetPassword(email);
  };

  const requiresMFA = !!(profile?.mfa_required && !profile?.mfa_enrolled);
  
  // Updated to check both profile.is_admin and role for admin status
  const isAdmin = role === 'admin' || role === 'superadmin' || !!profile?.is_admin;
  const isSuperAdmin = role === 'superadmin' || (!!profile?.is_admin && role === 'admin');
  const isOperator = role === 'operator' || isAdmin;

  const contextValue: AuthContextType = {
    session,
    user,
    profile,
    role,
    isLoading,
    isAdmin,
    isSuperAdmin,
    isOperator,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    requiresMFA,
  };

  console.log("[AUTH] Auth context updated:", {
    isLoading,
    isAdmin,
    isSuperAdmin,
    isOperator,
    role,
    profileExists: !!profile
  });

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
  console.log("[AUTH-HOOK] useAuth called, returning role:", context.role);
  return context;
};
