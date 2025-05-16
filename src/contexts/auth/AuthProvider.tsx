
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
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Reset profile when signing out
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setRole('user');
        }

        // Fetch user profile when signed in
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession?.user) {
          // Use setTimeout to avoid potential recursive auth state changes
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id, currentSession.user)
              .then(profileData => {
                if (profileData) setProfile(profileData);
              });
            fetchUserRole(currentSession.user.id, currentSession.user)
              .then(roleData => setRole(roleData));
          }, 0);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const profileData = await fetchUserProfile(currentSession.user.id, currentSession.user);
          if (profileData) setProfile(profileData);
          
          const roleData = await fetchUserRole(currentSession.user.id, currentSession.user);
          setRole(roleData);
        }
        
      } catch (error) {
        console.error("Error checking session:", error);
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
