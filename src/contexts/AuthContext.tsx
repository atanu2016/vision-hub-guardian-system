
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useLocalAdmin, setUseLocalAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Set up the auth state listener
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      setIsLoading(false);
    }
  }, [useLocalAdmin]);

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
      
      await firebaseSignOut(auth);
      navigate('/auth');
      toast.success('Successfully signed out');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Error sending password reset email');
      throw error;
    }
  };

  const requiresMFA = !!(profile?.mfa_required && !profile?.mfa_enrolled);
  const isAdmin = role === 'admin' || role === 'superadmin' || !!profile?.is_admin || useLocalAdmin;
  const isSuperAdmin = role === 'superadmin' || useLocalAdmin;
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
