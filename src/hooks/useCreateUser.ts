
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/admin';

interface CreateUserFormData {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  mfaRequired: boolean;
}

interface UseCreateUserOptions {
  onSuccess?: () => void;
}

export function useCreateUser({ onSuccess }: UseCreateUserOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    mfaRequired: true
  });
  
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const validateForm = (): boolean => {
    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    // Password length validation
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Creating user with email:", formData.email);
      
      // Create user in Supabase Auth
      const { data: userData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: { full_name: formData.fullName }
      });
      
      if (authError) throw authError;
      
      if (!userData.user) {
        throw new Error('Failed to create user');
      }
      
      console.log("User created successfully:", userData.user.id);
      
      // Create/Update profile 
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          full_name: formData.fullName,
          is_admin: formData.role === 'admin' || formData.role === 'superadmin',
          mfa_required: formData.mfaRequired
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here as the profile might be created by trigger
      }
      
      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userData.user.id,
          role: formData.role
        });
        
      if (roleError) {
        console.error('Role assignment error:', roleError);
        toast.error(`User created but role assignment failed: ${roleError.message}`);
      } else {
        toast.success('User created successfully');
        if (onSuccess) onSuccess();
      }
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting
  };
}
