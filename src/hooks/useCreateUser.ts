
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
      // Create the user through a secure backend function
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          user_metadata: { full_name: formData.fullName },
          role: formData.role,
          mfa_required: formData.mfaRequired
        }
      });
      
      if (error) throw error;
      
      if (!data || !data.userId) {
        throw new Error('Failed to create user');
      }
      
      console.log("User created successfully:", data.userId);
      
      toast.success('User created successfully');
      if (onSuccess) onSuccess();
      
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
