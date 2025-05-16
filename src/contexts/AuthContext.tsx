
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

export type UserRole = 'superadmin' | 'admin' | 'operator' | 'user';

export type Profile = {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  mfa_enrolled: boolean;
  mfa_required: boolean;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  requiresMFA: boolean;
  isSuperAdmin: boolean;
  isOperator: boolean;
};

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
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Reset profile when signing out
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setRole('user');
        }

        // Fetch user profile when signed in
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession?.user) {
          fetchUserProfile(currentSession.user.id);
          fetchUserRole(currentSession.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
        fetchUserRole(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      // Special handling for admin@home.local
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (userData?.user && userData.user.email === 'admin@home.local') {
        console.log("admin@home.local detected - ensuring admin status");
        
        // Make sure they're set as admin in profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError || !profileData || !profileData.is_admin) {
          // Create or update admin profile
          await supabase
            .from('profiles')
            .upsert({
              id: userId,
              full_name: 'Administrator',
              is_admin: true,
              mfa_required: false
            });
            
          // Also ensure role is set
          await supabase
            .from('user_roles')
            .upsert({
              user_id: userId,
              role: 'superadmin'
            });
            
          // Fetch the updated profile
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          setProfile(data as Profile);
          setRole('superadmin');
          return;
        }
      }
      
      // Normal profile fetch
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, is_admin, mfa_enrolled, mfa_required')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      console.log("Profile fetched:", data);
      setProfile(data as Profile);
      
      // If this is the first user (likely an admin), set admin status if not already set
      if (data && !data.is_admin) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (count === 1) {
          // This is the first and only user, make them admin
          console.log("First user detected, setting as admin");
          await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', userId);
            
          // Update local state to reflect admin status
          setProfile({...data, is_admin: true} as Profile);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching role for user:", userId);
      
      // Special handling for admin@home.local - always superadmin
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (userData?.user && userData.user.email === 'admin@home.local') {
        console.log("admin@home.local detected - setting as superadmin");
        
        // Ensure they have superadmin role
        await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'superadmin'
          });
        
        setRole('superadmin');
        return;
      }
      
      // Normal role fetch
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setRole('user'); // Default to regular user on error
        return;
      }
      
      console.log("Role data:", data);
      
      if (data) {
        setRole(data.role as UserRole);
      } else {
        // If this is the first user and no role exists, create a superadmin role
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (count === 1) {
          // This is the first and only user, make them superadmin
          console.log("First user detected, setting as superadmin");
          await supabase
            .from('user_roles')
            .upsert({ 
              user_id: userId, 
              role: 'superadmin' 
            });
            
          // Update local state
          setRole('superadmin');
        } else {
          // Default to 'user' if no role is assigned
          setRole('user');
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('user'); // Default to regular user on error
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // The navigation will happen automatically in the Auth component
      // when the user state changes due to the onAuthStateChange listener
      toast.success('Successfully signed in');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Navigate after successful sign out
      navigate('/auth');
      toast.success('Successfully signed out');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Error sending password reset email');
      throw error;
    }
  };

  const requiresMFA = !!(profile?.mfa_required && !profile?.mfa_enrolled);
  
  // Updated to check both profile.is_admin and role for admin status
  const isAdmin = role === 'admin' || role === 'superadmin' || !!profile?.is_admin;
  const isSuperAdmin = role === 'superadmin' || (!!profile?.is_admin && role === 'admin');
  const isOperator = role === 'operator' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        isLoading,
        isAdmin,
        isSuperAdmin,
        isOperator,
        signIn,
        signOut,
        resetPassword,
        requiresMFA,
      }}
    >
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
