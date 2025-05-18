
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, AuthState, Profile, UserRole } from './types';
import { fetchUserProfile, fetchUserRole } from './authUtils';
import { resetPassword, signIn, signOut } from './authActions';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Improved error handling for auth errors
const handleAuthError = (error: any, defaultMessage = 'Authentication error') => {
  console.error('[AUTH] Error:', error);
  const errorMsg = error?.message || defaultMessage;
  toast.error(errorMsg);
  return errorMsg;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const navigate = useNavigate();

  // Optimized function to fetch user data
  const fetchUserData = useCallback(async (userId: string, currentUser: User) => {
    try {
      console.log("[AUTH] Fetching user data for:", userId);
      
      // Fetch profile and role in parallel for better performance
      const [profileData, roleData] = await Promise.all([
        fetchUserProfile(userId, currentUser),
        fetchUserRole(userId, currentUser)
      ]);
      
      if (profileData) {
        console.log("[AUTH] Profile data fetched:", profileData);
        setProfile(profileData);
      }
      
      console.log("[AUTH] Role data fetched:", roleData);
      setRole(roleData);
      
      return { profile: profileData, role: roleData };
    } catch (error) {
      console.error("[AUTH] Error fetching user data:", error);
      return null;
    }
  }, []);

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
            setProfile(null);
            setRole('user');
            console.log("[AUTH] User signed out, reset role to 'user'");
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
    
    // Set up subscription for role changes
    let roleSubscription: any;
    
    const setupRoleSubscription = async () => {
      if (!user?.id || !mounted) return;
      
      console.log("[AUTH] Setting up role subscription for user:", user.id);
      
      roleSubscription = supabase
        .channel(`auth-role-changes-${user.id}`) // Use unique channel name
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        }, async (payload) => {
          if (!mounted) return;
          
          console.log('[AUTH] Role change detected:', payload);
          
          if (payload.new && typeof payload.new === 'object' && 'role' in payload.new) {
            console.log(`[AUTH] Updating role to: ${payload.new.role}`);
            setRole(payload.new.role as UserRole);
          } else {
            // Re-fetch role if the payload doesn't contain it
            setTimeout(async () => {
              if (!mounted) return;
              if (user) {
                const roleData = await fetchUserRole(user.id, user);
                console.log("[AUTH] Re-fetched role data:", roleData);
                setRole(roleData);
              }
            }, 0);
          }
        })
        .subscribe((status) => {
          console.log(`[AUTH] Role subscription status: ${status}`);
        });
    };
    
    if (user?.id) {
      setupRoleSubscription();
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (roleSubscription) roleSubscription.unsubscribe();
      console.log("[AUTH] Auth listener cleaned up");
    };
  }, [fetchUserData]);
  
  // Effect to update role subscription when user changes
  useEffect(() => {
    let roleSubscription: any;
    let mounted = true;
    
    const setupRoleSubscription = async () => {
      if (!user?.id || !mounted) return;
      
      // Unsubscribe from previous subscription if exists
      if (roleSubscription) {
        roleSubscription.unsubscribe();
      }
      
      console.log("[AUTH] Setting up new role subscription for user:", user.id);
      
      roleSubscription = supabase
        .channel(`auth-role-changes-${user.id}-${Date.now()}`) // Use unique channel name with timestamp
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        }, async (payload) => {
          if (!mounted) return;
          
          console.log('[AUTH] Role change detected in user effect:', payload);
          
          if (payload.new && typeof payload.new === 'object' && 'role' in payload.new) {
            console.log(`[AUTH] Updating role to: ${payload.new.role}`);
            setRole(payload.new.role as UserRole);
          }
        })
        .subscribe();
    };
    
    if (user?.id && authInitialized) {
      setupRoleSubscription();
    }
    
    return () => {
      mounted = false;
      if (roleSubscription) roleSubscription.unsubscribe();
    };
  }, [user?.id, authInitialized]);

  // Handle sign-in, sign-out and reset password functions
  const handleSignIn = async (email: string, password: string) => {
    console.log("[AUTH] Signing in user:", email);
    return signIn(email, password);
  };

  const handleSignOut = async () => {
    console.log("[AUTH] Signing out user");
    return signOut(navigate);
  };

  const handleResetPassword = async (email: string) => {
    console.log("[AUTH] Resetting password for:", email);
    return resetPassword(email);
  };

  const requiresMFA = !!(profile?.mfa_required && !profile?.mfa_enrolled);
  
  // Updated to check both profile.is_admin and role for admin status
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
