
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthContext } from '@/contexts/AuthContext';
import { Loader2, InfoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { auth, firestore } from '@/integrations/firebase/client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useContext } from 'react';
import { checkLocalAdminLogin, createLocalAdmin } from '@/services/userService';

// Define a version of useAuth that doesn't throw when outside provider
const useOptionalAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormProps = {
  onSuccess?: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
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

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@example.com', password: 'admin123' },
  });

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

  return (
    <Form {...form}>
      {firebaseError && (
        <Alert className="mb-6 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Firebase Connection Error</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{firebaseError}</p>
            <p className="text-sm">You can use the local admin account below:</p>
            <ul className="text-sm list-disc list-inside mt-1">
              <li>Email: admin@example.com</li>
              <li>Password: admin123</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {existingUsers.length > 0 && (
        <Alert className="mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Found {existingUsers.length} existing users</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col">
              <p className="mb-2 text-sm">Make all users superadmins to ensure you can login:</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={makeAdmins}
                disabled={isSubmitting}
                className="mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Make All Users Superadmins'
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showCreateAdmin ? (
        <>
          <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-md text-amber-800 dark:text-amber-300">
            <h3 className="text-sm font-medium">Create First Admin Account</h3>
            <p className="text-xs mt-1">No users found. Create a superadmin account to get started.</p>
          </div>
          <form onSubmit={form.handleSubmit(handleCreateAdmin)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating admin...
                </>
              ) : (
                'Create Superadmin Account'
              )}
            </Button>
          </form>
        </>
      ) : (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="mail@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log in'
            )}
          </Button>
        </form>
      )}
    </Form>
  );
};
