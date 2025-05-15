
import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { loginSchema } from './LoginFormUI';
import { supabase } from '@/integrations/supabase/client';
import { checkLocalAdminLogin, createLocalAdmin } from '@/services/userService';

export const useLoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    setFirebaseError(null);
    setSupabaseError(null);
    
    try {
      console.log("Attempting to sign in with email:", values.email);
      
      // Try local admin login first - most reliable path for testing
      if (checkLocalAdminLogin(values.email, values.password)) {
        console.log("Local admin login successful");
        createLocalAdmin();
        toast.success("Successfully logged in as local admin");
        if (onSuccess) onSuccess();
        setIsSubmitting(false);
        return;
      }
      
      // Only try Supabase and Firebase if not using local admin
      if (values.email !== 'admin@example.com' || values.password !== 'admin123') {
        // Try Supabase login
        try {
          console.log("Attempting Supabase login...");
          const { data, error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });
          
          if (!error && data.user) {
            console.log("Successfully logged in with Supabase:", data.user);
            toast.success("Successfully logged in with Supabase!");
            if (onSuccess) onSuccess();
            setIsSubmitting(false);
            return;
          }

          if (error) {
            console.error("Supabase login error:", error);
            setSupabaseError(error.message);
            toast.error(`Supabase login failed: ${error.message}`);
          }
        } catch (supabaseError: any) {
          console.error("Supabase login exception:", supabaseError);
          setSupabaseError(supabaseError.message || "Unknown Supabase error");
        }
        
        // If Supabase failed, try Firebase as last resort
        try {
          console.log("Attempting Firebase login...");
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
      }

      // If we reach here with no success from any method, suggest local admin
      toast.error("Login failed with all available methods. Please use the Local Admin option instead.");
      
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
    supabaseError,
    handleSubmit,
  };
};
