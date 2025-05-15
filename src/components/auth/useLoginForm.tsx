
import { useState, useEffect, useContext } from 'react';
import { z } from 'zod';
import { AuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { loginSchema } from './LoginFormUI';
import { supabase } from '@/integrations/supabase/client';
import { checkLocalAdminLogin, createLocalAdmin } from '@/services/userService';

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

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log("Attempting to sign in with email:", values.email);
      
      // Try Supabase login first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        console.error("Supabase login error:", error);
        toast.error(error.message || "Login failed. Please check your credentials.");
        
        // Try fallback methods if available
        if (authContext?.signIn) {
          try {
            await authContext.signIn(values.email, values.password);
            toast.success("Successfully logged in via Firebase!");
            if (onSuccess) onSuccess();
            return;
          } catch (firebaseError: any) {
            console.error("Firebase login error:", firebaseError);
            setFirebaseError(firebaseError.message);
          }
        } 
        
        // Try local admin login as last resort
        if (checkLocalAdminLogin(values.email, values.password)) {
          createLocalAdmin();
          toast.success("Successfully logged in as local admin");
          if (onSuccess) onSuccess();
          return;
        }
        
        // If we reach here, all login methods failed
        throw new Error(error.message || "Login failed");
      } else if (data.user) {
        // Successful Supabase login
        console.log("Successfully logged in with Supabase:", data.user);
        toast.success("Successfully logged in!");
        if (onSuccess) onSuccess();
        return;
      }
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
      console.log("Creating admin user in Supabase...");
      // Try to create user in Supabase first
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.email.split('@')[0],
            is_admin: true
          }
        }
      });
      
      if (error) {
        console.error("Supabase signup error:", error);
        toast.error(error.message || 'Failed to create admin account.');
      } else {
        console.log("Admin created in Supabase:", data);
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
      
      // Try updating user roles in Supabase
      for (const user of existingUsers) {
        console.log(`Setting user ${user.email} (${user.id}) as superadmin in Supabase...`);
        
        // Check if user_roles record exists
        const { data: existingRole, error: roleCheckError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (roleCheckError && roleCheckError.code !== 'PGRST116') {
          console.error('Error checking role:', roleCheckError);
        }
        
        if (!existingRole) {
          // Create a new role
          const { error } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'superadmin'
            });
          
          if (error) console.error('Error creating role:', error);
        } else {
          // Update existing role
          const { error } = await supabase
            .from('user_roles')
            .update({ role: 'superadmin' })
            .eq('id', existingRole.id);
          
          if (error) console.error('Error updating role:', error);
        }
        
        // Update profile is_admin flag
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', user.id);
        
        if (profileError) console.error('Error updating profile:', profileError);
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
