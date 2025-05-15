
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

export type UserRole = 'superadmin' | 'admin' | 'operator' | 'user';

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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        fetchUserProfile(currentUser.uid);
        fetchUserRole(currentUser.uid);
      } else {
        setProfile(null);
        setRole('user');
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const profileDoc = await getDoc(doc(firestore, 'profiles', userId));
      
      if (profileDoc.exists()) {
        setProfile(profileDoc.data() as Profile);
      } else {
        console.log('No profile found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const roleDoc = await getDoc(doc(firestore, 'user_roles', userId));
      
      if (roleDoc.exists()) {
        setRole(roleDoc.data().role as UserRole);
      } else {
        setRole('user'); // Default role
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('user'); // Default to regular user on error
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully signed in');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
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
  const isAdmin = role === 'admin' || role === 'superadmin' || !!profile?.is_admin;
  const isSuperAdmin = role === 'superadmin';
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
