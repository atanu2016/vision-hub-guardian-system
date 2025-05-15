
import { useState, useEffect, useContext } from 'react';
import { z } from 'zod';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { auth, firestore } from '@/integrations/firebase/client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { checkLocalAdminLogin, createLocalAdmin } from '@/services/userService';
import { loginSchema } from './LoginFormUI';

// Define a version of useAuth that doesn't throw when outside provider
export const useOptionalAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const useLoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  // Use the optional auth to avoid errors when rendered outside AuthProvider
  const authContext = useOptionalAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [existingUsers, setExistingUsers] = useState<Array<{email: string, id: string}>>([]);
  
  // Check if any users exist
  useEffect(() => {
    const checkForUsers = async () => {
      try {
        console.log("Checking for existing users in Firebase...");
        const profilesSnapshot = await getDocs(collection(firestore, 'profiles'));
        
        // Also check auth users collection if possible
        try {
          const usersQuery = query(collection(firestore, 'users'));
          const usersSnapshot = await getDocs(usersQuery);
          const usersList = usersSnapshot.docs.map(doc => ({
            email: doc.data().email,
            id: doc.id
          }));
          setExistingUsers(usersList);
          console.log(`Found ${usersSnapshot.size} users in auth collection`);
        } catch (authError) {
          console.log("Could not access auth users directly", authError);
        }
        
        if (profilesSnapshot.empty) {
          console.log("No profiles found, showing admin creation form");
          setShowCreateAdmin(true);
        } else {
          console.log(`Found ${profilesSnapshot.size} profiles`);
          const userProfiles = profilesSnapshot.docs.map(doc => ({
            email: doc.data().email || 'Unknown email',
            id: doc.id
          }));
          setExistingUsers(prev => [...prev, ...userProfiles]);
          setShowCreateAdmin(false);
        }
      } catch (error: any) {
        console.error('Error checking for users:', error);
        setFirebaseError(error.message || 'Firebase connection error');
      }
    };
    
    checkForUsers();
  }, []);

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      console.log("Attempting to sign in...");
      
      // If we have authContext, use that, otherwise try with local admin
      if (authContext?.signIn) {
        await authContext.signIn(values.email, values.password);
      } else {
        // Fallback if no auth context is available
        if (checkLocalAdminLogin(values.email, values.password)) {
          createLocalAdmin();
          toast.success("Successfully logged in as local admin");
          if (onSuccess) onSuccess();
          return;
        } else {
          throw new Error("Auth provider not available");
        }
      }
      
      toast.success("Successfully logged in!");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdmin = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      console.log("Creating admin user in Firebase...");
      // Register the user first
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      if (user) {
        console.log("User created, adding role and profile...");
        // Add the user to user_roles collection with superadmin role
        await setDoc(doc(firestore, 'user_roles', user.uid), {
          user_id: user.uid,
          role: 'superadmin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        // Also add to profiles collection
        await setDoc(doc(firestore, 'profiles', user.uid), {
          id: user.uid,
          full_name: values.email.split('@')[0],
          is_admin: true,
          mfa_enrolled: false,
          mfa_required: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        toast.success('Superadmin account created successfully! Please log in.');
        setShowCreateAdmin(false);
      }
    } catch (error: any) {
      console.error('Create admin error:', error);
      toast.error(error.message || 'Failed to create admin account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const makeAdmins = async () => {
    setIsSubmitting(true);
    try {
      if (existingUsers.length === 0) {
        toast.error('No existing users found to promote');
        return;
      }
      
      for (const user of existingUsers) {
        console.log(`Setting user ${user.email} (${user.id}) as superadmin...`);
        
        // Add or update user_roles collection
        await setDoc(doc(firestore, 'user_roles', user.id), {
          user_id: user.id,
          role: 'superadmin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        // Also ensure profile exists with admin flag
        const profileRef = doc(firestore, 'profiles', user.id);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          // Update existing profile
          await setDoc(profileRef, {
            ...profileSnap.data(),
            is_admin: true,
            mfa_required: false
          }, { merge: true });
        } else {
          // Create new profile
          await setDoc(profileRef, {
            id: user.id,
            full_name: user.email.split('@')[0],
            is_admin: true,
            mfa_enrolled: false,
            mfa_required: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
      
      toast.success(`Successfully made ${existingUsers.length} users superadmins!`);
    } catch (error: any) {
      console.error('Error making users admins:', error);
      toast.error(error.message || 'Failed to update user roles');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showCreateAdmin,
    firebaseError,
    existingUsers,
    handleSubmit,
    handleCreateAdmin,
    makeAdmins
  };
};
