
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { auth, firestore } from '@/integrations/firebase/client';
import { checkLocalAdminLogin, createLocalAdmin, isLocalAdminCreated } from '@/services/userService';
import { UserRole } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

export type Profile = {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  mfa_enrolled: boolean;
  mfa_required: boolean;
};

type AuthContextType = {
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
  useLocalAdmin: boolean;
};

// Export the context so it can be accessed directly if needed
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useLocalAdmin, setUseLocalAdmin] = useState<boolean>(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Check for Supabase session first
      const checkSupabaseSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Supabase session found:", session);
          setSupabaseUser(session.user);
          
          // Try to get or create profile for this Supabase user
          await fetchOrCreateSupabaseProfile(session.user);
        } else if (error) {
          console.error("Error checking Supabase session:", error);
        }
      };
      
      checkSupabaseSession();
      
      // Set up Supabase auth change listener
      const { data: { subscription: supabaseSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Supabase auth state change:", event, session?.user);
          
          if (session?.user) {
            setSupabaseUser(session.user);
            await fetchOrCreateSupabaseProfile(session.user);
          } else {
            setSupabaseUser(null);
          }
        }
      );
      
      // Set up the Firebase auth state listener as a fallback
      const firebaseUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        
        if (currentUser) {
          fetchUserProfile(currentUser.uid);
          fetchUserRole(currentUser.uid);
        } else if (useLocalAdmin) {
          // If using local admin mode
          setProfile({
            id: 'local-admin-id',
            full_name: 'Local Admin',
            is_admin: true,
            mfa_enrolled: false,
            mfa_required: false,
          });
          setRole('superadmin');
        } else {
          setProfile(null);
          setRole('user');
        }
        
        setIsLoading(false);
      });

      return () => {
        supabaseSubscription.unsubscribe();
        firebaseUnsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth state listeners:", error);
      setIsLoading(false);
    }
  }, [useLocalAdmin]);

  const fetchOrCreateSupabaseProfile = async (user: any) => {
    if (!user) return;
    
    try {
      console.log("Fetching Supabase profile for:", user.id);
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile:", profileError);
        return;
      }
      
      if (profileData) {
        console.log("Profile found:", profileData);
        setProfile(profileData as Profile);
        
        // Set as admin
        if (!profileData.is_admin) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', user.id);
          
          if (updateError) {
            console.error("Error updating admin status:", updateError);
          } else {
            console.log("Set user as admin");
          }
        }
        
        // Check for user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (!roleError && roleData) {
          setRole(roleData.role as UserRole);
        } else {
          // Create superadmin role
          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'superadmin'
            });
          
          if (insertRoleError) {
            console.error("Error creating superadmin role:", insertRoleError);
          } else {
            setRole('superadmin');
            console.log("Created superadmin role for user");
          }
        }
      } else {
        // Create new profile
        console.log("Creating new profile for Supabase user");
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || null,
            is_admin: true,
            mfa_enrolled: false,
            mfa_required: false
          });
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
          return;
        }
        
        // Create superadmin role
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'superadmin'
          });
        
        if (insertRoleError) {
          console.error("Error creating superadmin role:", insertRoleError);
        } else {
          console.log("Created superadmin role for new user");
        }
        
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          is_admin: true,
          mfa_enrolled: false,
          mfa_required: false,
        });
        setRole('superadmin');
      }
    } catch (error) {
      console.error("Error in fetchOrCreateSupabaseProfile:", error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const profileDoc = await getDoc(doc(firestore, 'profiles', userId));
      
      if (profileDoc.exists()) {
        setProfile(profileDoc.data() as Profile);
      } else {
        console.log('No profile found, creating one...');
        
        // Get user information if available
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        // Create a default profile for this user
        const newProfile = {
          id: userId,
          full_name: userData?.displayName || user?.displayName || null,
          is_admin: true, // Set as admin by default for existing users
          mfa_enrolled: false,
          mfa_required: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await setDoc(doc(firestore, 'profiles', userId), newProfile);
        setProfile(newProfile as Profile);
        console.log('Created default profile for user');
        
        // Also set as superadmin for existing users without roles
        await setDoc(doc(firestore, 'user_roles', userId), {
          user_id: userId,
          role: 'superadmin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setRole('superadmin');
        console.log('Set user as superadmin');
      }
    } catch (error) {
      console.error('Error fetching/creating user profile:', error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const roleDoc = await getDoc(doc(firestore, 'user_roles', userId));
      
      if (roleDoc.exists()) {
        setRole(roleDoc.data().role as UserRole);
      } else {
        console.log('No role found, setting as superadmin for existing user');
        // Set as superadmin for existing users without roles
        await setDoc(doc(firestore, 'user_roles', userId), {
          user_id: userId,
          role: 'superadmin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setRole('superadmin');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('user'); // Default to regular user on error
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // First try Supabase login
      console.log("Attempting Supabase login...");
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (supabaseData?.user) {
        console.log("Supabase login successful:", supabaseData.user);
        toast.success('Successfully signed in via Supabase');
        navigate('/');
        return;
      }
      
      if (supabaseError) {
        console.log("Supabase login failed, trying fallbacks:", supabaseError);
      }
      
      // Check if this is a local admin login
      if (checkLocalAdminLogin(email, password)) {
        createLocalAdmin();
        setUseLocalAdmin(true);
        toast.success('Logged in as local admin');
        navigate('/');
        return;
      }

      // Otherwise try Firebase
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully signed in');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (useLocalAdmin) {
        setUseLocalAdmin(false);
        setProfile(null);
        setRole('user');
        navigate('/auth');
        toast.success('Successfully signed out');
        return;
      }
      
      // Sign out from Supabase if there's a Supabase user
      if (supabaseUser) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out from Supabase:', error);
        } else {
          setSupabaseUser(null);
        }
      }
      
      // Also sign out from Firebase if applicable
      await firebaseSignOut(auth);
      navigate('/auth');
      toast.success('Successfully signed out');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Try Supabase password reset first
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email);
      
      if (supabaseError) {
        console.log("Supabase password reset failed, trying Firebase:", supabaseError);
        // Fall back to Firebase if Supabase fails
        await sendPasswordResetEmail(auth, email);
      }
      
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Error sending password reset email');
      throw error;
    }
  };

  const requiresMFA = !!(profile?.mfa_required && !profile?.mfa_enrolled);
  const isAdmin = role === 'admin' || role === 'superadmin' || !!profile?.is_admin || useLocalAdmin || !!supabaseUser;
  const isSuperAdmin = role === 'superadmin' || useLocalAdmin || !!supabaseUser;
  const isOperator = role === 'operator' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
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
        useLocalAdmin,
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
