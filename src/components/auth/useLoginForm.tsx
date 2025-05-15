
import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { loginSchema } from './LoginFormUI';
import { supabase } from '@/integrations/supabase/client';
import { checkLocalAdminLogin, createLocalAdmin } from '@/services/userService';

export const useLoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    setFirebaseError(null);
    
    try {
      console.log("Attempting to sign in with email:", values.email);
      
      // First try local admin login - fastest path for testing
      if (checkLocalAdminLogin(values.email, values.password)) {
        createLocalAdmin();
        toast.success("Successfully logged in as local admin");
        if (onSuccess) onSuccess();
        setIsSubmitting(false);
        return;
      }
      
      // Try Supabase login second
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (!error && data.user) {
          // Successful Supabase login
          console.log("Successfully logged in with Supabase:", data.user);
          toast.success("Successfully logged in!");
          if (onSuccess) onSuccess();
          setIsSubmitting(false);
          return;
        }

        // If Supabase login fails, show error but don't block - we'll try other methods
        console.error("Supabase login error:", error);
      } catch (supabaseError) {
        console.error("Supabase login exception:", supabaseError);
      }
      
      // If we reach here, try importing Firebase auth as last resort
      try {
        // Import the necessary Firebase functions dynamically
        const firebaseModule = await import('@/contexts/AuthContext');
        if (firebaseModule && typeof firebaseModule.useAuth === 'function') {
          const auth = firebaseModule.useAuth();
          if (auth && auth.signIn) {
            await auth.signIn(values.email, values.password);
            toast.success("Successfully logged in via Firebase!");
            if (onSuccess) onSuccess();
            setIsSubmitting(false);
            return;
          }
        }
      } catch (firebaseError: any) {
        console.error("Firebase login error:", firebaseError);
        setFirebaseError(firebaseError.message || "Firebase authentication failed");
      }

      // If all methods fail and we've reached here, show a generic error
      toast.error("Login failed with all available methods. Please check your credentials.");
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please use Local Admin option instead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    firebaseError,
    handleSubmit,
  };
};
