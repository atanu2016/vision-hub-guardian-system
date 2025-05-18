
import { useContext, useState, useCallback } from 'react';
import { Profile, UserRole, AuthContextType } from './types';
import { resetPassword, signIn, signOut } from './authActions';
import AuthContext from './AuthContext';
import { useAuthState } from './useAuthState';
import { useSessionManager } from './useSessionManager';
import { useRoleSubscriptionManager } from './useRoleSubscriptionManager';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Get state management functions
  const {
    user,
    setUser,
    session,
    setSession,
    profile,
    setProfile,
    role,
    setRole,
    isLoading,
    setIsLoading,
    authInitialized,
    setAuthInitialized,
    fetchUserData
  } = useAuthState();

  // Setup session manager
  useSessionManager(
    setUser,
    setSession,
    setIsLoading,
    setAuthInitialized,
    fetchUserData
  );

  // Setup role subscription
  useRoleSubscriptionManager(
    user?.id, 
    authInitialized,
    setRole
  );

  // Reset profile and role when user signs out
  const handleProfileReset = useCallback(() => {
    setProfile(null);
    setRole('user');
    console.log("[AUTH] Reset profile and role to defaults");
  }, [setProfile, setRole]);

  // Handle sign-in function - now returns Promise<boolean> to match the type
  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    console.log("[AUTH] Signing in user:", email);
    return signIn(email, password);
  };

  // Handle sign-out function
  const handleSignOut = async () => {
    console.log("[AUTH] Signing out user");
    handleProfileReset();
    return signOut();
  };

  // Handle reset password function
  const handleResetPassword = async (email: string) => {
    console.log("[AUTH] Resetting password for:", email);
    return resetPassword(email);
  };

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

  console.log("[AUTH] Auth context updated:", {
    isLoading,
    isAdmin,
    isSuperAdmin,
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
  return context;
};
